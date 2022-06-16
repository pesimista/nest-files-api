import { Test, TestingModule } from '@nestjs/testing'
import { ImagesService } from './images.service'
import axios from 'axios'
import { AppConfigServiceMock } from '../../../test/mocks/config.mocks'
import { AppConfigService } from '../../config/providers/configuration.service'
import { fail } from 'assert'

jest.mock('axios')

describe('ThirdpartyService', () => {
  let service: ImagesService

  beforeEach(async () => {
    jest.clearAllMocks()
    jest.spyOn(axios, 'create').mockReturnThis()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImagesService,
        { provide: AppConfigService, useValue: AppConfigServiceMock },
      ],
    }).compile()

    service = module.get<ImagesService>(ImagesService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('#search', () => {
    it('should throw an error if the axios request fails', async () => {
      const axiosSpy = jest.spyOn(axios, 'get').mockRejectedValue({
        response: { data: { message: 'axios error' } },
      })

      try {
        await service.search('office', 1)
        fail('unexpected code path')
      } catch (error) {
        expect(error.status).toEqual(422)
        expect(axiosSpy).toHaveBeenCalled()
      }
    })

    it('should throw an error if the axios request fails', async () => {
      const axiosSpy = jest
        .spyOn(axios, 'get')
        .mockRejectedValue(new Error('some othe error'))

      try {
        await service.search('office', 1)
        fail('unexpected code path')
      } catch (error) {
        expect(error.status).toEqual(400)
        expect(axiosSpy).toHaveBeenCalled()
      }
    })

    it('should return the information from unsplash parsed', async () => {
      const axiosSpy = jest.spyOn(axios, 'get').mockResolvedValue({
        data: {
          total: 133,
          total_pages: 7,
          results: [
            {
              id: 'eOLpJytrbsQ',
              created_at: '2014-11-18T14:35:36-05:00',
              width: 4000,
              height: 3000,
              color: '#A7A2A1',
              blur_hash: 'LaLXMa9Fx[D%~q%MtQM|kDRjtRIU',
              likes: 286,
              liked_by_user: false,
              description: 'A man drinking a coffee.',
              urls: {
                raw: 'https://images',
                full: 'https://hd',
                regular: 'https://images',
                small: 'https://images',
                thumb: 'https://images',
              },
              links: {
                self: 'https://api',
                html: 'http://unsplash.com',
                download: 'http://unsplash.com',
              },
            },
          ],
        },
      })

      try {
        const res = await service.search('office')

        expect(res).toHaveProperty('items')
        expect(res).toHaveProperty('totalPages')
        expect(res).toHaveProperty('next', 2)
        expect(axiosSpy).toHaveBeenCalled()
      } catch (error) {
        console.log(error)
        fail('unexpected code path')
      }
    })

    it('should check the next condition', async () => {
      const axiosSpy = jest.spyOn(axios, 'get').mockResolvedValue({
        data: {
          total: 133,
          total_pages: 7,
          results: [],
        },
      })

      try {
        const res = await service.search('office', 7)

        expect(res).toHaveProperty('items')
        expect(res).toHaveProperty('totalPages')
        expect(res).toHaveProperty('next', 7)
        expect(axiosSpy).toHaveBeenCalled()
      } catch (error) {
        console.log(error)
        fail('unexpected code path')
      }
    })
  })

  describe('#download', () => {
    it('return a buffer with the image information from unsplash', async () => {
      const axiosSpy = jest
        .spyOn(axios, 'get')
        .mockResolvedValueOnce({
          data: {
            id: 'eOLpJytrbsQ',
            links: { download: 'http://unsplash.com' },
          },
        })
        .mockResolvedValueOnce({ data: new ArrayBuffer(20) })

      const res = await service.download('eOLpJytrbsQ')

      expect(axiosSpy).toHaveBeenCalledTimes(2)
      expect(Buffer.isBuffer(res)).toBeTruthy()
    })
  })
})
