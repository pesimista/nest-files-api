import { Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import * as cookieParser from 'cookie-parser'
import { AppModule } from './app.module'
import { AppConfigService } from './config/providers/configuration.service'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const logger = new Logger('bootstrap')
  const config = app.get(AppConfigService)

  // app.enableCors(config.corsConfig)
  app.use(cookieParser())
  app.useGlobalPipes(new ValidationPipe())

  const options = new DocumentBuilder()
    .setTitle('Aluxion technical test API')
    .setDescription('')
    .setVersion('1.0')
    .build()
  const document = SwaggerModule.createDocument(app, options)
  SwaggerModule.setup('/api', app, document)

  await app.listen(config.port)

  logger.log(`Server started on port ${config.port}`)
}
bootstrap()
