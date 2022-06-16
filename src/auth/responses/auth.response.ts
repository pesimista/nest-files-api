import { ApiResponseOptions } from '@nestjs/swagger'
import {
  SwaggerResponseOptions,
  HttpError,
} from '../../config/types/responses.type'

const profileResponse: ApiResponseOptions = {
  schema: {
    properties: {
      name: { type: 'string', example: 'Texas' },
      lastName: { type: 'string', example: 'Red' },
      email: { type: 'string', example: 'red1@texas.com' },
      createdAt: { type: 'string', example: '2022-06-15T00:40:04.115Z' },
      updatedAt: { type: 'string', example: '2022-06-15T00:40:04.115Z' },
      id: { type: 'string', example: '62a92a646e14d5c34bfa50c4' },
    },
  },
}

export const RegisterResponse: SwaggerResponseOptions = {
  ok: profileResponse,
  confict: {
    schema: {
      properties: {
        statusCode: { type: 'number', example: 409 },
        message: { type: 'string', example: 'Email already taken' },
      },
    },
  },
}

export const LoginResponse: SwaggerResponseOptions = {
  ok: profileResponse,
  unprocessableEntity: {
    schema: {
      properties: HttpError,
      example: {
        statusCode: 422,
        message: 'Incorrect email or password',
      },
    },
  },
  unauthorized: {
    schema: {
      properties: HttpError,
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  },
}
