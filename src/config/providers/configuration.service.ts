import { MailerOptions } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'
import { JwtModuleOptions } from '@nestjs/jwt'
import { MongooseModuleOptions } from '@nestjs/mongoose'

@Injectable()
export class AppConfigService {
  get port(): number | string {
    return process.env.PORT || 3200
  }

  get database(): MongooseModuleOptions {
    return {
      uri: process.env.DATABASE_URL,
    }
  }

  get s3() {
    return {
      credentials: {
        accessKeyId: process.env.S3_KEY,
        secretAccessKey: process.env.S3_SECRET,
      },
      bucket: process.env.S3_BUCKET,
    }
  }

  get mailer(): MailerOptions['transport'] {
    return {
      host: process.env.MAILER_HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAILER_USER,
        pass: process.env.MAILER_PASS,
      },
    }
  }

  get jwt(): JwtModuleOptions {
    const minutes = process.env.EXPIRATION_MINUTES || '1'

    return {
      secret: process.env.JWT_KEY_SECRET || 'secret',
      signOptions: {
        expiresIn: `${minutes}m`,
      },
    }
  }

  get tokenName(): string {
    return process.env.TOKEN_NAME || 'token'
  }

  get imageAPI(): { key: string; secret: string } {
    return {
      key: process.env.UNSPLASH_ACCESS_KEY,
      secret: process.env.UNSPLASH_SECRET_KEY,
    }
  }
}
