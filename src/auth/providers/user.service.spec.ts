import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { fail } from 'assert'
import { Model } from 'mongoose'
import { User } from '../schemas/users.schema'
import { RegisterUserDto } from '../dto/register.dto'
import { UserService } from './user.service'

describe('UserService', () => {
  let service: UserService

  const mockUserModel = {
    ...Model,
    create: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile()

    service = module.get<UserService>(UserService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('#register', () => {
    it('should throw an error if the email is already taken', async () => {
      const dto: RegisterUserDto = {
        name: 'texas',
        email: 'red@texas.com',
        password: 'secretpassword',
      }

      const createSpy = jest
        .spyOn(mockUserModel, 'create')
        .mockRejectedValue({ code: 11000 })

      try {
        await service.register(dto)
        fail('unexpected code path')
      } catch (error) {
        expect(createSpy).toHaveBeenCalled()
        expect(error.status).toBe(409)
        expect(error.message).toBe('Email already taken')
      }
    })

    it('should create the user and return it with isAnonymous as false', async () => {
      const dto: RegisterUserDto = {
        name: 'texas',
        email: 'red@texas.com',
        password: 'secretpassword',
      }

      const createSpy = jest
        .spyOn(mockUserModel, 'create')
        .mockImplementation((item) => item)

      try {
        const user = await service.register(dto)

        expect(user.name).toEqual(dto.name)
        expect(user.email).toEqual(dto.email)
        expect(user.password).toEqual(dto.password)

        expect(createSpy).toHaveBeenCalled()
      } catch (error) {
        fail(`unexpected code path: ${error.message}`)
      }
    })
  })

  describe('#findByEmail', () => {
    it('should get an user by email', async () => {
      const user = {
        name: 'test',
        email: 'red@texas.com',
      }

      const findSpy = jest
        .spyOn(mockUserModel, 'findOne')
        .mockResolvedValue(user)

      const doc = await service.findByEmail('red@texas.com')

      expect(doc.name).toEqual(user.name)
      expect(doc.email).toEqual(user.email)

      expect(findSpy).toHaveBeenCalledWith({ email: 'red@texas.com' })
    })
  })

  describe('#updateRecoveryCode', () => {
    it('should return null if the user doesnt exist', async () => {
      const findSpy = jest
        .spyOn(mockUserModel, 'findOne')
        .mockResolvedValue(null)

      const res = await service.updateRecoveryCode('some@email.com')

      expect(res).toBeNull()

      expect(findSpy).toHaveBeenCalledWith({ email: 'some@email.com' })
    })

    it('should return the user with a five digit recovery code', async () => {
      const user = {
        id: 'someid',
        email: 'some@email.com',
        save: jest.fn(),
      }

      const findSpy = jest
        .spyOn(mockUserModel, 'findOne')
        .mockResolvedValue(user)

      const res = await service.updateRecoveryCode('some@email.com')

      expect(res).toHaveProperty('recoveryCode')
      expect(res.recoveryCode.code).toBeGreaterThanOrEqual(10000)
      expect(user.save).toHaveBeenCalled()
      expect(findSpy).toHaveBeenCalledWith({ email: 'some@email.com' })
    })
  })

  describe('#updatePassword', () => {
    it(`should throw an error if the code doesn't match any`, async () => {
      const findSpy = jest
        .spyOn(mockUserModel, 'findOne')
        .mockResolvedValue(null)

      try {
        await service.updatePassword(12345, 'somepassword')
        fail('unexpected code path')
      } catch (error) {
        expect(findSpy).toHaveBeenCalled()
        expect(error.status).toBe(401)
      }
    })

    it(`should throw an error if the code is correct but has expired`, async () => {
      const expiration = new Date()
      expiration.setMinutes(expiration.getMinutes() - 30)

      const findSpy = jest
        .spyOn(mockUserModel, 'findOne')
        .mockResolvedValue({ recoveryCode: { expiration } })

      try {
        await service.updatePassword(12345, 'somepassword')
        fail('unexpected code path')
      } catch (error) {
        expect(findSpy).toHaveBeenCalled()
        expect(error.status).toBe(400)
      }
    })

    it('should return the user with a five digit recovery code', async () => {
      const expiration = new Date()
      expiration.setMinutes(expiration.getMinutes() + 30)

      const user = {
        id: 'someid',
        email: 'some@email.com',
        recoveryCode: { expiration },
        save: jest.fn(),
      }

      const findSpy = jest
        .spyOn(mockUserModel, 'findOne')
        .mockResolvedValue(user)

      const res = await service.updatePassword(12345, 'somepassword')

      expect(res).toHaveProperty('password', 'somepassword')
      expect(findSpy).toHaveBeenCalled()
      expect(user.save).toHaveBeenCalled()
    })
  })
})
