/* eslint-disable @typescript-eslint/no-this-alias */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import * as bcrypt from 'bcrypt'
import { Document, Model } from 'mongoose'
import { RecoveryCode } from '../types/recoveryCode.type'

export type UserDocument = User & Document
export type UserModel = Model<UserDocument> & {
  isEmailTaken: (email: string, excludeUserId?: string) => Promise<boolean>
}

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
      delete ret._id
      delete ret.password
      delete ret.salt
      delete ret.recoveryCode
    },
  },
})
export class User {
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
    lowercase: true,
  })
  email: string

  @Prop({
    type: String,
    trim: true,
    minlength: 8,
    validate(value) {
      if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
        throw new Error(
          'Password must contain at least one letter and one number'
        )
      }
    },
  })
  password: string

  @Prop({ type: String })
  salt: string

  @Prop({
    type: {
      code: { type: Number },
      expiration: { type: Date },
    },
  })
  recoveryCode: RecoveryCode

  isPasswordMatch: (pass: string) => Promise<boolean>
}

export const UserSchema = SchemaFactory.createForClass(User)

UserSchema.pre<UserDocument>('save', async function () {
  const user = this
  if (user.isModified('password')) {
    const salt = await bcrypt.genSalt(8)
    user.salt = salt
    user.password = await bcrypt.hash(user.password, salt)
  }
})

UserSchema.methods.isPasswordMatch = function (
  password: string
): Promise<boolean> {
  const user: UserDocument = this
  return bcrypt.compare(password, user.password)
}
