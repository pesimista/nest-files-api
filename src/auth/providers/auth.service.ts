import { MailerService } from '@nestjs-modules/mailer'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UserDocument } from '../schemas/users.schema'
import { JwtPayload } from '../types/jwt.types'
import { TokenResponse } from '../types/loginResponse.types'
import { UserService } from './user.service'

@Injectable()
export class AuthService {
  constructor(
    private service: UserService,
    private jwt: JwtService,
    private mailService: MailerService
  ) {}

  async validateEmailAndPassword(
    email: string,
    pass: string
  ): Promise<UserDocument> {
    const user = await this.service.findByEmail(email)

    if (!user || !(await user.isPasswordMatch(pass))) {
      throw new HttpException(
        'Incorrect email or password',
        HttpStatus.UNPROCESSABLE_ENTITY
      )
    }

    return user
  }

  createToken(user: UserDocument): TokenResponse {
    const payload: JwtPayload = { email: user.email, sub: user.id }
    return {
      accessToken: this.jwt.sign(payload),
      user,
    }
  }

  async sendEmail(email: string, code: number): Promise<boolean> {
    await this.mailService.sendMail({
      to: email,
      subject: 'Recovery code - ALUXION API',
      html: `
        <p>
          This is your recovery code for the ALUXION API: <b>${code}</b>
        </p>
        <p>
          <i>do not share with anyone<i>
        </p>`,
    })

    return true
  }
}
