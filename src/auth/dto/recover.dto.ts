import { ApiProperty } from '@nestjs/swagger'
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator'

export class RecoverPasswordDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  code: number

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string
}
