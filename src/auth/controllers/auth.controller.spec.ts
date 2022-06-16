import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common'
import { NestApplication } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import * as cookieParser from 'cookie-parser'
import * as request from 'supertest'
import { JwtAuthGuard } from '../../config/guards/jwt-auth.guard'
import { AppConfigService } from '../../config/providers/configuration.service'
import { RegisterUserDto } from '../dto/register.dto'
import { AuthService } from '../providers/auth.service'
import { UserService } from '../providers/user.service'
import { JwtStrategy } from '../strategies/jwt.strategy'
import { LocalStrategy } from '../strategies/local.strategy'
import { AuthController } from './auth.controller'

describe('AuthController - Integration', () => {
  let controller: AuthController
  let app: NestApplication

  let accessToken = ''

  const AppConfigServiceMock = {
    tokenName: 'aluxion',
    jwt: { secret: 'secret' },
  }

  const authServiceMock = {
    validateEmailAndPassword: jest.fn(),
    createToken: jest.fn(),
    sendEmail: jest.fn(),
  }

  const UserServiceMock = {
    findByEmail: jest.fn(),
    register: jest.fn(),
    updateRecoveryCode: jest.fn(),
    updatePassword: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'secret',
          signOptions: { expiresIn: '1m' },
        }),
      ],
      controllers: [AuthController],
      providers: [
        JwtStrategy,
        LocalStrategy,
        { provide: AuthService, useValue: authServiceMock },
        { provide: UserService, useValue: UserServiceMock },
        { provide: AppConfigService, useValue: AppConfigServiceMock },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest()
          req.user = { id: 'userid', email: 'some@email.com' }
          return true
        },
      })
      .compile()

    controller = module.get<AuthController>(AuthController)

    app = module.createNestApplication()

    app.use(cookieParser())
    app.useGlobalPipes(new ValidationPipe())

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('#GET /auth/profile', () => {
    it('should return an user token without creating new ones', async () => {
      const userMock = {
        id: 'someid',
        email: 'some@email.com',
        isAnonymous: true,
      }

      UserServiceMock.findByEmail.mockResolvedValue(userMock)
      const createTokenSpy = jest.spyOn(authServiceMock, 'createToken')

      const res = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Cookie', [accessToken])

      expect(res.body).toEqual(userMock)
      expect(res.statusCode).toBe(200)

      expect(UserServiceMock.findByEmail).toHaveBeenCalledWith(userMock.email)
      expect(createTokenSpy).not.toHaveBeenCalled()
    })

    it('should throw an error if the user is not found on the database', async () => {
      UserServiceMock.findByEmail.mockResolvedValue(null)
      const createTokenSpy = jest.spyOn(authServiceMock, 'createToken')

      const res = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Cookie', [accessToken])

      expect(res.statusCode).toBe(422)
      expect(res.body).toHaveProperty('statusCode', 422)
      expect(res.body).toHaveProperty('message', 'invalid token')

      expect(UserServiceMock.findByEmail).toHaveBeenCalledWith('some@email.com')
      expect(createTokenSpy).not.toHaveBeenCalled()
    })
  })

  describe('#POST /auth/register', () => {
    it('should throw an error if register fails', async () => {
      const userDTO: RegisterUserDto = {
        email: 'registered@mail.com',
        name: 'Texas',
        password: 'secretpassword',
      }

      UserServiceMock.register.mockRejectedValue(
        new HttpException('Email already taken', HttpStatus.CONFLICT)
      )
      const createSpy = jest.spyOn(authServiceMock, 'createToken')

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .set('Cookie', [accessToken])
        .send(userDTO)

      expect(res.statusCode).toBe(409)
      expect(res.body).toHaveProperty('statusCode', 409)
      expect(res.body).toHaveProperty('message', 'Email already taken')

      expect(UserServiceMock.register).toHaveBeenCalledWith(userDTO)
      expect(createSpy).not.toHaveBeenCalled()
    })

    it('should create a new user', async () => {
      const userDTO: RegisterUserDto = {
        email: 'registered@mail.com',
        name: 'Texas',
        password: 'secretpassword',
      }

      const registeredMock = {
        ...userDTO,
        id: 'someid',
      }

      UserServiceMock.register.mockResolvedValue(registeredMock)
      const createSpy = jest.spyOn(authServiceMock, 'createToken')
      createSpy.mockReturnValue('sometoken')

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userDTO)

      expect(res.headers['set-cookie'][0]).toContain(
        `${AppConfigServiceMock.tokenName}=`
      )
      expect(res.body).toEqual(registeredMock)
      expect(res.statusCode).toBe(201)

      expect(UserServiceMock.register).toHaveBeenCalledWith(userDTO)
      expect(createSpy).toHaveBeenCalledWith(registeredMock)

      accessToken = res.headers['set-cookie'][0]
    })
  })

  describe('#POST /auth/login', () => {
    it('should throw throw an error if the password mismatch', async () => {
      const loginInfo = {
        username: 'registered@mail.com',
        password: 'secretpassword',
      }

      authServiceMock.validateEmailAndPassword.mockRejectedValue(
        new HttpException(
          'Incorrect email or password',
          HttpStatus.UNPROCESSABLE_ENTITY
        )
      )

      UserServiceMock.findByEmail.mockResolvedValue(null)

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginInfo)

      expect(res.statusCode).toBe(422)
      expect(res.body).toHaveProperty('statusCode', 422)
      expect(res.body).toHaveProperty('message', 'Incorrect email or password')

      expect(authServiceMock.validateEmailAndPassword).toHaveBeenCalledWith(
        loginInfo.username,
        loginInfo.password
      )
      expect(UserServiceMock.findByEmail).not.toHaveBeenCalled()
    })

    it('should return the user info with the token as a cookie', async () => {
      const loginInfo = {
        username: 'registered@mail.com',
        password: 'secretpassword',
      }

      const registeredMock = {
        email: 'registered@mail.com',
        name: 'Texas Red',
        id: 'someid',
      }

      authServiceMock.validateEmailAndPassword.mockReturnValue(registeredMock)
      authServiceMock.createToken.mockReturnValue('somerandomtoken')

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginInfo)

      expect(res.headers['set-cookie'][0]).toContain(
        `${AppConfigServiceMock.tokenName}=`
      )

      expect(res.statusCode).toBe(201)
      expect(res.body).toEqual(registeredMock)

      expect(authServiceMock.validateEmailAndPassword).toHaveBeenCalledWith(
        loginInfo.username,
        loginInfo.password
      )
      expect(authServiceMock.createToken).toHaveBeenCalled()
    })
  })

  describe('#GET /auth/signout', () => {
    it('should expire the token', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/signout')
        .set('Cookie', [accessToken])

      expect(res.headers['set-cookie'][0]).toContain(
        `${AppConfigServiceMock.tokenName}=`
      )

      const [, expires] = res.headers['set-cookie'][0].split('Expires=')
      const date = new Date(expires)
      expect(date.getTime()).toBeLessThan(new Date().getTime())
    })
  })

  describe('#GET /auth/recover', () => {
    it('should send an email with a recovery code', async () => {
      UserServiceMock.updateRecoveryCode.mockResolvedValue({
        id: 'someid',
        email: 'red@texas.com',
        recoveryCode: { code: 12312 },
      })

      const res = await request(app.getHttpServer()).get(
        '/auth/recover?email=red@texas.com'
      )

      expect(UserServiceMock.updateRecoveryCode).toHaveBeenCalledWith(
        'red@texas.com'
      )
      expect(authServiceMock.sendEmail).toHaveBeenCalledWith(
        'red@texas.com',
        12312
      )

      expect(res.body).toHaveProperty('message')
    })

    it('should not send an email if the user is not registered', async () => {
      UserServiceMock.updateRecoveryCode.mockResolvedValue(null)

      const res = await request(app.getHttpServer()).get(
        '/auth/recover?email=red@texas.com'
      )

      expect(UserServiceMock.updateRecoveryCode).toHaveBeenCalledWith(
        'red@texas.com'
      )
      expect(authServiceMock.sendEmail).not.toHaveBeenCalled()

      expect(res.body).toHaveProperty('message')
    })

    it('should return an error', async () => {
      UserServiceMock.updateRecoveryCode.mockRejectedValue(
        new UnauthorizedException()
      )

      const res = await request(app.getHttpServer()).get(
        '/auth/recover?email=red@texas.com'
      )

      expect(UserServiceMock.updateRecoveryCode).toHaveBeenCalled()
      expect(res.status).toEqual(401)
    })
  })

  describe('#POST /auth/recover', () => {
    it('should call the right methods', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/recover')
        .send({ code: 12345, password: 'somepass123' })

      expect(UserServiceMock.updatePassword).toHaveBeenCalled()
      expect(res.body).toHaveProperty('message')
    })

    it('should return an error', async () => {
      UserServiceMock.updatePassword.mockRejectedValue(
        new UnauthorizedException()
      )

      const res = await request(app.getHttpServer())
        .post('/auth/recover')
        .send({ code: 12345, password: 'somepass123' })

      expect(UserServiceMock.updatePassword).toHaveBeenCalled()
      expect(res.status).toEqual(401)
    })
  })
})
