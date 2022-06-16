import { Test, TestingModule } from '@nestjs/testing'
import { AwsService } from '../../files/providers/aws.service'
import { FilesService } from '../../files/providers/files.service'
import { ImagesService } from '../providers/images.service'
import { ImagesController } from './images.controller'

describe('ImagesController - Integration', () => {
  let controller: ImagesController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: ImagesService, useValue: jest.fn() },
        { provide: AwsService, useValue: jest.fn() },
        { provide: FilesService, useValue: jest.fn() },
      ],
      controllers: [ImagesController],
    }).compile()

    controller = module.get<ImagesController>(ImagesController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
