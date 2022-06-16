import { SwaggerResponseOptions } from '../../config/types/responses.type'

export const SearchImageResponse: SwaggerResponseOptions = {
  ok: {
    schema: {
      properties: {
        totalPages: { type: 'number', example: 1001 },
        next: { type: 'number', example: 1001 },
        items: {
          type: 'array',
          example: [
            {
              id: '8rS5UgAc5iw',
              createdAt: '2022-03-31T10:47:51-04:00',
              updatedAt: '2022-06-14T11:26:56-04:00',
              width: 8256,
              height: 5504,
              color: '#d9d9d9',
              urls: {
                raw: 'https://images.unsplash.com/photo-1648737963059',
                full: 'https://images.unsplash.com/photo-1648737963059',
                regular: 'https://images.unsplash.com/photo-1648737963059',
                small: 'https://images.unsplash.com/photo-1648737963059',
                thumb: 'https://images.unsplash.com/photo-1648737963059',
                small_s3:
                  'https://s3.us-west-2.amazonaws.com/images.unsplash.com/photo-1648737963059',
              },
              links: {
                self: 'https://api.unsplash.com/photos/8rS5UgAc5iw',
                html: 'https://unsplash.com/photos/8rS5UgAc5iw',
                download: 'https://unsplash.com/photos/8rS5UgAc5iw/download',
                download_location:
                  'https://api.unsplash.com/photos/8rS5UgAc5iw/download',
              },
            },
          ],
        },
      },
    },
  },
}
