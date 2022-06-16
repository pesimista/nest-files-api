import { Test, TestingModule } from '@nestjs/testing'
import { AppConfigService } from './configuration.service'

describe('AppConfigService', () => {
  let service: AppConfigService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppConfigService],
    }).compile()

    service = module.get<AppConfigService>(AppConfigService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('#port', () => {
    it('should return the default port 3200', () => {
      const parent = service.port

      expect(parent).toEqual(3200)
    })

    it('should return the right port', () => {
      process.env.PORT = '4200'

      const parent = service.port

      expect(parent).toEqual('4200')
    })
  })

  describe('#database', () => {
    it('should return the data for database', () => {
      process.env.DATABASE_URL = 'value'

      const database = service.database

      expect(database).toEqual({
        uri: 'value',
      })
    })
  })

  describe('#S3', () => {
    it('should return the data for mailer', () => {
      process.env.S3_KEY = 'somekey'
      process.env.S3_SECRET = 'somesecret'
      process.env.S3_BUCKET = 'aluxion-bucket'

      const s3 = service.s3

      expect(s3).toHaveProperty('bucket', 'aluxion-bucket')
      expect(s3).toHaveProperty('credentials')
      expect(s3.credentials).toHaveProperty('accessKeyId', 'somekey')
      expect(s3.credentials).toHaveProperty('secretAccessKey', 'somesecret')
    })
  })

  describe('#mailer', () => {
    it('should return the data for mailer', () => {
      process.env.MAILER_HOST = 'somehost'
      process.env.MAILER_USER = 'someuser'
      process.env.MAILER_PASS = 'somepass'

      const mailer = service.mailer

      expect(mailer).toHaveProperty('host', 'somehost')
      expect(mailer).toHaveProperty('auth')
      expect(mailer['auth']).toHaveProperty('user', 'someuser')
      expect(mailer['auth']).toHaveProperty('pass', 'somepass')
    })
  })

  describe('#jwt', () => {
    it('should return the default data for jwt', () => {
      const jwt = service.jwt

      expect(jwt).toEqual({
        secret: 'secret',
        signOptions: {
          expiresIn: `1m`,
        },
      })
    })

    it('should return the data for jwt', () => {
      process.env.EXPIRATION_MINUTES = '10'
      process.env.JWT_KEY_SECRET = 'value'

      const jwt = service.jwt

      expect(jwt).toEqual({
        secret: 'value',
        signOptions: {
          expiresIn: `10m`,
        },
      })
    })
  })

  describe('#tokenName', () => {
    it('should return the data for tokenName', () => {
      const tokenName = service.tokenName

      expect(tokenName).toEqual('token')
    })
  })

  describe('#imageAPI', () => {
    it('should return the data for tokenName', () => {
      process.env.UNSPLASH_ACCESS_KEY = 'access-key'
      process.env.UNSPLASH_SECRET_KEY = 'secret-key'

      const imageAPI = service.imageAPI

      expect(imageAPI).toHaveProperty('key', 'access-key')
      expect(imageAPI).toHaveProperty('secret', 'secret-key')
    })
  })
})
