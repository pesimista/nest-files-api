import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User, UserDocument } from '../schemas/users.schema'
import { RegisterUserDto } from '../dto/register.dto'

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private model: Model<UserDocument>) {}

  async findByEmail(email: string): Promise<UserDocument> {
    return this.model.findOne({ email })
  }

  async register(user: RegisterUserDto): Promise<UserDocument> {
    try {
      const doc = await this.model.create({
        name: user.name,
        email: user.email,
        password: user.password,
      })

      return doc
    } catch (error) {
      // email not unique
      if (error.code === 11000) {
        throw new HttpException('Email already taken', HttpStatus.CONFLICT)
      }

      throw error
    }
  }

  async updateRecoveryCode(email: string): Promise<UserDocument> {
    const user = await this.findByEmail(email)

    if (!user) {
      return null
    }

    let code
    do {
      code = Math.floor(Math.random() * 100000)
    } while (code < 10000)

    const expiration = new Date()
    expiration.setMinutes(expiration.getMinutes() + 30)

    user.recoveryCode = { code, expiration }

    await user.save()
    return user
  }

  async updatePassword(code: number, password: string): Promise<UserDocument> {
    const user = await this.model.findOne({ 'recoveryCode.code': code })

    if (!user) {
      throw new UnauthorizedException()
    }
    const now = new Date()

    if (now > user.recoveryCode.expiration) {
      throw new BadRequestException('code expired')
    }

    user.password = password
    await user.save()
    return user
  }
}
