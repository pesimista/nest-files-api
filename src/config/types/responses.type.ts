import { ApiResponseOptions } from '@nestjs/swagger'

export type SwaggerResponseOptions = {
  ok: ApiResponseOptions
  confict?: ApiResponseOptions
  notFound?: ApiResponseOptions
  unauthorized?: ApiResponseOptions
  unprocessableEntity?: ApiResponseOptions
}

export const HttpError = {
  statusCode: { type: 'number' },
  message: { type: 'string' },
}

export const UnauthorizedExample = {
  schema: {
    properties: HttpError,
    example: {
      statusCode: 401,
      message: 'Unauthorized',
    },
  },
}

export const NotFoundExample = {
  schema: {
    properties: HttpError,
    example: {
      statusCode: 404,
      message: 'Not Found',
    },
  },
}
