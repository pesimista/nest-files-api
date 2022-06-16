import { Injectable } from '@nestjs/common'
import { AWSError, S3 } from 'aws-sdk'
import { PromiseResult } from 'aws-sdk/lib/request'
import * as crypto from 'crypto'
import * as stream from 'stream'

import { AppConfigService } from '../../config/providers/configuration.service'

@Injectable()
export class AwsService {
  s3: S3
  bucket: string

  constructor(private config: AppConfigService) {
    this.s3 = new S3({ credentials: config.s3.credentials })

    this.bucket = config.s3.bucket
  }

  async getItems(): Promise<S3.ObjectList> {
    const res = await this.s3
      .listObjects({ Bucket: this.bucket, Delimiter: '/' })
      .promise()

    return res.Contents
  }

  async getSingleItem(
    key: string
  ): Promise<PromiseResult<S3.GetObjectOutput, AWSError>> {
    const res = await this.s3
      .getObject({ Bucket: this.bucket, Key: key })
      .promise()

    return res
  }

  async getItemStream(key): Promise<stream.Readable> {
    const res = await this.s3
      .getObject({
        Bucket: this.bucket,
        Key: key,
      })
      .createReadStream()

    return res
  }

  async generatePresignedUrl(key) {
    return this.s3.getSignedUrlPromise('getObject', {
      Bucket: this.bucket,
      Key: key,
    })
  }

  async postItem(file: Buffer, filename: string): Promise<string> {
    const Key = this.getName(filename)

    const res = await this.s3
      .upload({
        Bucket: this.bucket,
        Body: file,
        Key,
      })
      .promise()

    return res.Key
  }

  async renameFile(currentKey: string, newName: any) {
    const Key = this.getName(newName)
    const CopySource = `${this.bucket}/${currentKey}`
    await this.s3
      .copyObject({
        Bucket: this.bucket,
        CopySource: encodeURIComponent(CopySource),
        Key,
      })
      .promise()

    // THE GIVEN USER DOES NOT HAVE PERMISSION TO DELETE FILES IN THE BUCKET
    //
    // await this.s3
    //   .deleteObject({
    //     Bucket: this.bucket,
    //     Key: currentKey,
    //   })
    //   .promise()

    return Key
  }

  getName(filename: string): string {
    const name = filename.replace(/\s+/gi, '-')
    const uid = crypto.randomBytes(4).toString('hex')
    return `${uid}-${name}`
  }
}
