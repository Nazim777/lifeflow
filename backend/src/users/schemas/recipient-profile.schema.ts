import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';

export type RecipientProfileDocument = RecipientProfile & Document;

@Schema({ timestamps: true })
export class RecipientProfile {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
    userId: User;

    @Prop({ required: true })
    name: string;

    @Prop({ required: false })
    phoneNumber: string;

    @Prop({ type: Object, required: true })
    location: {
        city: string;
        area: string;
        coordinates?: [number, number];
    };
}

export const RecipientProfileSchema = SchemaFactory.createForClass(RecipientProfile);
