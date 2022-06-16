import { Test, TestingModule } from '@nestjs/testing'
import { AwsService } from '../providers/aws.service'
import { FilesService } from '../providers/files.service'
import { FilesController } from './files.controller'

describe('FilesController - Integration', () => {
  let controller: FilesController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: AwsService, useValue: jest.fn() },
        { provide: FilesService, useValue: jest.fn() },
      ],
      controllers: [FilesController],
    }).compile()

    controller = module.get<FilesController>(FilesController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
