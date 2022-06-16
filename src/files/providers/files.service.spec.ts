import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { Model } from 'mongoose'
import { File, FileDocument } from '../schemas/files.schema'
import { FilesService } from './files.service'

describe('FilesService', () => {
  let service: FilesService

  const fileModelMock = {
    ...Model,
    create: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: getModelToken(File.name),
          useValue: fileModelMock,
        },
      ],
    }).compile()

    service = module.get<FilesService>(FilesService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('#getItems', () => {
    it('should return a collection with all the files', async () => {
      fileModelMock.find = jest.fn().mockReturnValue([])

      const res = await service.getItems()

      expect(Array.isArray(res)).toBeTruthy()
      expect(fileModelMock.find).toHaveBeenCalled()
    })
  })
  describe('#getSingle', () => {
    it('should return null if the id is less than 24 characters long', async () => {
      fileModelMock.findById = jest.fn()

      const res = await service.getSingle('someshow')

      expect(res).toBeNull()
      expect(fileModelMock.findById).not.toHaveBeenCalled()
    })

    it('should return the document info with the given Id', async () => {
      fileModelMock.findById = jest
        .fn()
        .mockResolvedValue({ id: '9ed9f20c8e52b0ddb519d630' })

      const res = await service.getSingle('9ed9f20c8e52b0ddb519d630')

      expect(res).not.toBeNull()
      expect(fileModelMock.findById).toHaveBeenCalledWith(
        '9ed9f20c8e52b0ddb519d630'
      )
    })
  })

  describe('#registerFile', () => {
    it('should create a new entry for a file', async () => {
      fileModelMock.create.mockImplementation((item) => item)

      const file = {
        user: 'someuserid',
        name: 'file name.png',
        key: 'fdd8f30b-file-name.png',
      }

      const res = await service.registerFile(file)

      expect(res).toEqual(file)
      expect(fileModelMock.create).toHaveBeenCalled()
    })
  })

  describe('#renameFile', () => {
    it('should call the right methods and update the file', async () => {
      const file: Partial<FileDocument> = {
        user: 'someuserid',
        name: 'file name.png',
        key: 'fdd8f30b-file-name.png',
        save: jest.fn(),
      }

      const newFile = {
        name: 'some wallpaper.png',
        key: 'fdd8f30b-some-wallpaper.png',
      }

      const res = await service.renameFile(file as FileDocument, newFile)

      expect(res).toHaveProperty('name', newFile.name)
      expect(res).toHaveProperty('key', newFile.key)
      expect(file.save).toHaveBeenCalled()
    })
  })
})
