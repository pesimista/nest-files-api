import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { RequestJwt } from '../../auth/types/request.type'
import { JwtAuthGuard } from '../../config/guards/jwt-auth.guard'
import { UnauthorizedExample } from '../../config/types/responses.type'
import { AwsService } from '../../files/providers/aws.service'
import { FilesService } from '../../files/providers/files.service'
import { GetSingleFile } from '../../files/responses/files.response'
import { SaveImageDto } from '../dto/saveImage.dto'
import { SearchImageDto } from '../dto/searchImage.dto'
import { ImagesService } from '../providers/images.service'
import { SearchImageResponse } from '../responses/images.response'

@ApiTags('Images')
@Controller('images')
export class ImagesController {
  constructor(
    private imagesService: ImagesService,
    private awsService: AwsService,
    private filesService: FilesService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'search in unsplash API for photos' })
  @ApiOkResponse(SearchImageResponse.ok)
  @ApiUnauthorizedResponse(UnauthorizedExample)
  async searchImages(@Query() { q, page }: SearchImageDto) {
    return this.imagesService.search(q, page)
  }

  @Post('save')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'save the photo from unsplash to the AWS' })
  @ApiOkResponse(GetSingleFile.ok)
  @ApiUnauthorizedResponse(UnauthorizedExample)
  async saveImages(@Req() req: RequestJwt, @Body() body: SaveImageDto) {
    let name = body.name ?? body.imageId
    name += '.jpg'

    const buffer = await this.imagesService.download(body.imageId)
    const key = await this.awsService.postItem(buffer, name)
    return this.filesService.registerFile({
      user: req.user.id,
      key,
      name,
    })
  }
}
