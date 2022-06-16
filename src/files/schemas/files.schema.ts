import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Document, Model } from 'mongoose'
import { UserDocument } from '../../auth/schemas/users.schema'

export type FileDocument = File & Document
export type FileModel = Model<FileDocument>

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
      delete ret._id
    },
  },
})
export class File {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: string | UserDocument

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  name: string

  @Prop({
    type: String,
    required: true,
    unique: true,
    trim: true,
  })
  key: string
}

export const FileSchema = SchemaFactory.createForClass(File)
