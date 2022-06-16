import { MailerModule, MailerOptions } from '@nestjs-modules/mailer'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose'
import { AuthModule } from './auth/auth.module'
import { AppConfigModule } from './config/config.module'
import { AppConfigService } from './config/providers/configuration.service'
import { FilesModule } from './files/files.module'
import { ImagesModule } from './images/images.module'

@Module({
  imports: [
    AppConfigModule,
    MailerModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (config: AppConfigService): MailerOptions => {
        return {
          transport: config.mailer,
          defaults: { from: 'iqimqdzrszwqlfvmbu@nthrl.com' },
        }
      },
    }),
    MongooseModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (config: AppConfigService): MongooseModuleOptions => {
        return {
          uri: config.database.uri,
        }
      },
    }),
    ConfigModule,
    AuthModule,
    FilesModule,
    ImagesModule,
  ],
})
export class AppModule {}
