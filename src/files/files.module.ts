import { Module } from '@nestjs/common'

import { AwsService } from './providers/aws.service'
import { FilesService } from './providers/files.service'
import { FilesController } from './controllers/files.controller'
import { AppConfigModule } from '../config/config.module'
import { MongooseModule } from '@nestjs/mongoose'
import { FileSchema, File } from './schemas/files.schema'

@Module({
  imports: [
    AppConfigModule,
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
  ],
  providers: [AwsService, FilesService],
  controllers: [FilesController],
})
export class FilesModule {}
