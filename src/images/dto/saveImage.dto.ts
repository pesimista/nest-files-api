import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class SaveImageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  imageId: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name: string
}
