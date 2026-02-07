import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';

export type DonorProfileDocument = DonorProfile & Document;

@Schema({ timestamps: true })
export class DonorProfile {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
    userId: User;

    @Prop({ required: true })
    name: string;

    @Prop()
    age: number;

    @Prop()
    gender: string;

    @Prop()
    weight: number;

    @Prop()
    bloodGroup: string;

    @Prop()
    phone: string;

    @Prop({ type: Object })
    location: {
        city: string;
        area: string;
        coordinates?: [number, number];
    };

    @Prop({ default: true })
    availability: boolean;

    @Prop()
    lastDonationDate: Date;

    @Prop({ default: true })
    isVisible: boolean;
}

export const DonorProfileSchema = SchemaFactory.createForClass(DonorProfile);
