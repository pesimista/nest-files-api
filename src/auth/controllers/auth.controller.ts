import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import {
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'
import { Response } from 'express'
import { JwtAuthGuard } from '../../config/guards/jwt-auth.guard'
import { LocalAuthGuard } from '../../config/guards/local-auth.guard'
import { AppConfigService } from '../../config/providers/configuration.service'

import { LoginDto } from '../dto/login.dto'
import { ChangePasswordDto, RecoverPasswordDto } from '../dto/recover.dto'
import { RegisterUserDto } from '../dto/register.dto'
import { AuthService } from '../providers/auth.service'
import { UserService } from '../providers/user.service'
import { LoginResponse, RegisterResponse } from '../responses/auth.response'
import { UserDocument } from '../schemas/users.schema'
import { RequestJwt, RequestLocal } from '../types/request.type'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private config: AppConfigService
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiOkResponse(RegisterResponse.ok)
  @ApiConflictResponse(RegisterResponse.confict)
  async register(
    @Body() dto: RegisterUserDto,
    @Res({ passthrough: true }) response: Response
  ): Promise<UserDocument> {
    try {
      const user = await this.userService.register(dto)

      const token = this.authService.createToken(user)
      response.cookie(this.config.tokenName, token.accessToken)

      return user
    } catch (error) {
      // space to add error login to sentry or any other logger service
      throw error
    }
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Log into an user account and return a JWT' })
  @ApiOkResponse(LoginResponse.ok)
  @ApiUnauthorizedResponse(RegisterResponse.unauthorized)
  @ApiUnprocessableEntityResponse(LoginResponse.unprocessableEntity)
  async login(
    @Req() req: RequestLocal,
    @Body() _body: LoginDto,
    @Res({ passthrough: true }) response: Response
  ): Promise<UserDocument> {
    const token = this.authService.createToken(req.user)

    response.cookie(this.config.tokenName, token.accessToken)

    return req.user
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'returns the current user information' })
  @ApiOkResponse(LoginResponse.ok)
  @ApiUnauthorizedResponse(RegisterResponse.unauthorized)
  async getUser(@Req() req: RequestJwt): Promise<UserDocument> {
    try {
      const user = await this.userService.findByEmail(req.user.email)

      if (!user) {
        throw new HttpException(
          'invalid token',
          HttpStatus.UNPROCESSABLE_ENTITY
        )
      }

      return user
    } catch (error) {
      // space to add error login to sentry or any other logger service
      throw error
    }
  }

  @Get('recover')
  @ApiOperation({ summary: 'send an email with the token to recover password' })
  @ApiOkResponse()
  async recover(@Query() query: RecoverPasswordDto): Promise<object> {
    try {
      const user = await this.userService.updateRecoveryCode(query.email)

      if (user) {
        await this.authService.sendEmail(user.email, user.recoveryCode.code)
      }

      return {
        message:
          `if your email is registered, we've sent an email with a recovery code.` +
          `You have 30 minutes to update your password`,
      }
    } catch (error) {
      // space to add error login to sentry or any other logger service
      throw error
    }
  }

  @Post('recover')
  @ApiOperation({ summary: 'update the user password,' })
  @ApiOkResponse()
  async changePassword(@Body() body: ChangePasswordDto): Promise<object> {
    try {
      await this.userService.updatePassword(body.code, body.password)
      return {
        message: `password updated successfully`,
      }
    } catch (error) {
      // space to add error login to sentry or any other logger service
      throw error
    }
  }

  @Get('signout')
  @ApiOperation({ summary: 'removes the session cookie' })
  async logout(@Res({ passthrough: true }) res: Response): Promise<void> {
    res.cookie(this.config.tokenName, '', { expires: new Date() })
    return
  }
}
