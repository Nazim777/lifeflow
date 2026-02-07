import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';

export type HospitalProfileDocument = HospitalProfile & Document;

@Schema({ timestamps: true })
export class HospitalProfile {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
    userId: User;

    @Prop({ required: true })
    institutionName: string;

    @Prop()
    contactPerson: string;

    @Prop({ type: Object })
    location: {
        city: string;
        area: string;
        coordinates?: [number, number];
    };

    @Prop()
    licenseNumber: string;

    @Prop()
    contactNumber: string;
}

export const HospitalProfileSchema = SchemaFactory.createForClass(HospitalProfile);
