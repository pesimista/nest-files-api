import { Test, TestingModule } from '@nestjs/testing'
import { AppConfigServiceMock } from '../../../test/mocks/config.mocks'
import { AppConfigService } from '../../config/providers/configuration.service'
import { AwsService } from './aws.service'

describe('AwsService', () => {
  const Bucket = AppConfigServiceMock.s3.bucket
  let service: AwsService

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AwsService,
        { provide: AppConfigService, useValue: AppConfigServiceMock },
      ],
    }).compile()

    service = module.get<AwsService>(AwsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('#getItems', () => {
    it('should return a list with all the items in the bucket root', async () => {
      const promise = jest.fn().mockResolvedValue({ Contents: [] })
      service.s3.listObjects = jest.fn().mockReturnValue({ promise })

      const res = await service.getItems()

      expect(Array.isArray(res)).toBeTruthy()
      expect(promise).toHaveBeenCalled()
      expect(service.s3.listObjects).toHaveBeenCalledWith({
        Bucket,
        Delimiter: '/',
      })
    })
  })

  describe('#getSingleItem', () => {
    it('should call the right methods', async () => {
      const promise = jest.fn()
      service.s3.getObject = jest.fn().mockReturnValue({ promise })

      await service.getSingleItem('somekey')

      expect(promise).toHaveBeenCalled()
      expect(service.s3.getObject).toHaveBeenCalledWith({
        Bucket,
        Key: 'somekey',
      })
    })
  })

  describe('#getItemStream', () => {
    it('should return the item as a stream', async () => {
      const createReadStream = jest.fn()
      service.s3.getObject = jest.fn().mockReturnValue({ createReadStream })

      await service.getItemStream('somekey')

      expect(createReadStream).toHaveBeenCalled()
      expect(service.s3.getObject).toHaveBeenCalledWith({
        Bucket,
        Key: 'somekey',
      })
    })
  })

  describe('#generatePresignedUrl', () => {
    it('should', async () => {
      service.s3.getSignedUrlPromise = jest.fn().mockReturnValue('https://')

      await service.generatePresignedUrl('somekey')

      expect(service.s3.getSignedUrlPromise).toHaveBeenCalledWith('getObject', {
        Bucket,
        Key: 'somekey',
      })
    })
  })

  describe('#postItem', () => {
    it('should call the method to upload the file to the s3 Bucket', async () => {
      const promise = jest.fn().mockResolvedValue({ Key: 'key' })
      service.s3.upload = jest.fn().mockReturnValue({ promise })

      const buffer = Buffer.from('')
      const res = await service.postItem(buffer, 'filename.png')

      expect(typeof res === 'string').toBeTruthy()
      expect(promise).toHaveBeenCalled()
      expect(service.s3.upload).toHaveBeenCalled()
    })
  })

  describe('#renameFile', () => {
    it('should copy the file and delete in order to rename it', async () => {
      const promise = jest.fn()
      service.s3.copyObject = jest.fn().mockReturnValue({ promise })

      // service.s3.deleteObject = jest.fn().mockReturnValue({ promise })

      const res = await service.renameFile(
        'current-file.png',
        'new-address.jpg'
      )

      expect(typeof res === 'string').toBeTruthy()
      expect(promise).toHaveBeenCalled()
      expect(service.s3.copyObject).toHaveBeenCalled()
    })
  })
})
