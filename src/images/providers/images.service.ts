import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common'
import axios, { AxiosInstance } from 'axios'
import { AppConfigService } from '../../config/providers/configuration.service'
import { UnsplashImage } from '../types/image.type'

@Injectable()
export class ImagesService {
  client: AxiosInstance

  constructor(private config: AppConfigService) {
    this.client = axios.create({
      baseURL: 'https://api.unsplash.com',
      headers: {
        Authorization: `Client-ID ${this.config.imageAPI.key}`,
      },
    })
  }

  async search(query: string, page = 1) {
    try {
      const res = await this.client.get(`/search/photos`, {
        params: { query, page },
      })

      const parsed = res.data.results.map((item) => {
        return {
          id: item.id,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          width: item.width,
          height: item.height,
          color: item.color,
          urls: item.urls,
          links: item.links,
        }
      })

      const next = res.data.total_pages === page ? page : +page + 1

      return {
        items: parsed,
        totalPages: res.data.total_pages,
        next,
      }
    } catch (error) {
      if (error.response) {
        throw new UnprocessableEntityException(error.response.data)
      }

      throw new BadRequestException(error.message)
    }
  }

  async download(id: string): Promise<Buffer> {
    const image = await this.client.get<UnsplashImage>(`/photos/${id}`)
    const file = await this.client.get(image.data.links.download, {
      responseType: 'arraybuffer',
    })

    return Buffer.from(file.data, 'binary')
  }
}
