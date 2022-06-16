import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AppConfigModule } from '../config/config.module'
import { AwsService } from '../files/providers/aws.service'
import { FilesService } from '../files/providers/files.service'
import { FileSchema, File } from '../files/schemas/files.schema'
import { ImagesController } from './controllers/images.controller'
import { ImagesService } from './providers/images.service'

@Module({
  imports: [
    AppConfigModule,
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
  ],
  providers: [AwsService, FilesService, ImagesService],
  controllers: [ImagesController],
})
export class ImagesModule {}
