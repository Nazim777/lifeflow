import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
    DONOR = 'donor',
    RECIPIENT = 'recipient',
    HOSPITAL = 'hospital',
    ADMIN = 'admin',
}

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true, enum: UserRole, default: UserRole.DONOR })
    role: string;

    @Prop({ default: false })
    isVerified: boolean;

    @Prop({ default: false })
    isBlocked: boolean;

    @Prop()
    resetPasswordToken: string;

    @Prop()
    refreshToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
