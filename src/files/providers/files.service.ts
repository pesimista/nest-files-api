import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { File, FileDocument, FileModel } from '../schemas/files.schema'

@Injectable()
export class FilesService {
  constructor(@InjectModel(File.name) private fileModel: FileModel) {}

  async getItems(): Promise<FileDocument[]> {
    return this.fileModel.find()
  }

  async getSingle(id: string): Promise<FileDocument> {
    if (id.length < 24) {
      return null
    }

    return this.fileModel.findById(id)
  }

  async registerFile(file: File): Promise<FileDocument> {
    return this.fileModel.create({
      user: file.user,
      name: file.name,
      key: file.key,
    })
  }

  async renameFile(file: FileDocument, newFile: Partial<FileDocument>) {
    file.name = newFile.name
    file.key = newFile.key
    await file.save()
    return file
  }
}
