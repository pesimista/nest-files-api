import { SwaggerResponseOptions } from '../../config/types/responses.type'

export const GetAllItemsResponse: SwaggerResponseOptions = {
  ok: {
    schema: {
      type: 'array',
      example: [
        {
          user: '62a8ff5f56ecc1671af645b1',
          name: 'Screenshot 2022-05-17 165122.png',
          key: 'da6405cc-Screenshot-2022-05-17-165122.png',
          createdAt: '2022-06-14T21:52:07.336Z',
          updatedAt: '2022-06-14T21:52:07.336Z',
          id: '62a903077d37e810007c5ad1',
        },
      ],
    },
  },
}

export const GetAllS3ItemsResponse: SwaggerResponseOptions = {
  ok: {
    schema: {
      type: 'array',
      example: [
        {
          Key: '68996b66-test.jpg',
          LastModified: '2022-06-14T22:06:59.000Z',
          ETag: '"b01471573889bf9c85b699aa1f28bb42"',
          ChecksumAlgorithm: [],
          Size: 3801,
          StorageClass: 'STANDARD',
          Owner: {},
        },
      ],
    },
  },
}

export const GetSingleFile: SwaggerResponseOptions = {
  ok: {
    schema: {
      properties: {
        user: { type: 'string', example: '62a8ff5f56ecc1671af645b1' },
        name: { type: 'string', example: 'something in the way' },
        key: { type: 'string', example: 'bd3ac0e7-something-in-the-way' },
        createdAt: { type: 'string', example: '2022-06-15T00:31:39.884Z' },
        updatedAt: { type: 'string', example: '2022-06-15T00:31:39.884Z' },
        id: { type: 'string', example: '62a9286b2312c074ad326e96' },
        url: {
          type: 'string',
          example: 'https://aluxion-testing.com/bd3ac0e7',
        },
      },
    },
  },
}
