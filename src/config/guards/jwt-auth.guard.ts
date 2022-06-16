import { Injectable, SetMetadata } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

export const ALLOW_ANONYMOUS_META_KEY = 'allowAnonymous'
export const AllowAnonymous = () => SetMetadata(ALLOW_ANONYMOUS_META_KEY, true)

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
