import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { RequestJwt } from '../../auth/types/request.type'

import { FileInterceptor } from '@nestjs/platform-express'
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { Response } from 'express'
import { JwtAuthGuard } from '../../config/guards/jwt-auth.guard'
import {
  NotFoundExample,
  UnauthorizedExample,
} from '../../config/types/responses.type'
import { RenameFileDto } from '../dtos/renameFile.dto'
import { AwsService } from '../providers/aws.service'
import { FilesService } from '../providers/files.service'
import {
  GetAllItemsResponse,
  GetAllS3ItemsResponse,
  GetSingleFile,
} from '../responses/files.response'
import { FileDocument } from '../schemas/files.schema'

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(
    private awsService: AwsService,
    private filesService: FilesService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'retrieve all the docs stored in the database' })
  @ApiOkResponse(GetAllItemsResponse.ok)
  @ApiUnauthorizedResponse(UnauthorizedExample)
  async getAllItems(): Promise<FileDocument[]> {
    return this.filesService.getItems()
  }

  @Get('s3')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'retrieve all the files stored in the bucket' })
  @ApiOkResponse(GetAllS3ItemsResponse.ok)
  @ApiUnauthorizedResponse(UnauthorizedExample)
  async getItemsFromS3(): Promise<object[]> {
    return this.awsService.getItems()
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'get a the info for a single file' })
  @ApiOkResponse(GetSingleFile.ok)
  @ApiNotFoundResponse(NotFoundExample)
  @ApiUnauthorizedResponse(UnauthorizedExample)
  async GET(@Param('id') id: string) {
    const file = await this.filesService.getSingle(id)

    if (!file) {
      throw new NotFoundException()
    }

    const url = await this.awsService.generatePresignedUrl(file.key)
    return { ...file.toJSON(), url }
  }

  @Get(':id/download')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'download a file from the aws bucket' })
  @ApiOkResponse()
  @ApiNotFoundResponse(NotFoundExample)
  @ApiUnauthorizedResponse(UnauthorizedExample)
  async download(@Param('id') id: string, @Res() res: Response) {
    const file = await this.filesService.getSingle(id)

    if (!file) {
      throw new NotFoundException()
    }

    const stream = await this.awsService.getItemStream(file.key)
    stream.pipe(res)
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary:
      'upload a file to the aws bucket and store the info in the database',
  })
  @ApiOkResponse(GetSingleFile.ok)
  @ApiUnauthorizedResponse(UnauthorizedExample)
  async uploadFile(
    @Req() req: RequestJwt,
    @UploadedFile() file: Express.Multer.File
  ): Promise<FileDocument> {
    if (!file) {
      throw new BadRequestException('Missing file')
    }

    const key = await this.awsService.postItem(file.buffer, file.originalname)

    const fileDoc = await this.filesService.registerFile({
      key,
      name: file.originalname,
      user: req.user.id,
    })

    return fileDoc
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'rename an existing file',
  })
  @ApiOkResponse(GetSingleFile.ok)
  @ApiNotFoundResponse(NotFoundExample)
  @ApiUnauthorizedResponse(UnauthorizedExample)
  async renameFile(
    @Param('id') id: string,
    @Body() body: RenameFileDto
  ): Promise<FileDocument> {
    const doc = await this.filesService.getSingle(id)

    if (!doc) {
      throw new NotFoundException()
    }

    const key = await this.awsService.renameFile(doc.key, body.name)
    const fileDoc = await this.filesService.renameFile(doc, {
      name: body.name,
      key,
    })

    return fileDoc
  }
}
