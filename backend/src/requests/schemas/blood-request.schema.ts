import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type BloodRequestDocument = BloodRequest & Document;

export enum RequestUrgency {
    NORMAL = 'normal',
    CRITICAL = 'critical',
}

export enum RequestStatus {
    PENDING = 'pending',
    APPROVED = 'approved', // Hospital approves request
    ACCEPTED = 'accepted', // Donor accepts request (or Hospital assigns)
    REJECTED = 'rejected', // Hospital rejects request
    COMPLETED = 'completed',
    EXPIRED = 'expired',
}

@Schema({ timestamps: true })
export class BloodRequest {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    requesterId: User;

    @Prop({ required: true })
    patientName: string;

    @Prop({ required: true })
    bloodGroup: string;

    @Prop({ required: true })
    units: number;

    @Prop({ required: true, enum: RequestUrgency, default: RequestUrgency.NORMAL })
    urgency: string;

    @Prop({ required: true, enum: RequestStatus, default: RequestStatus.PENDING })
    status: string;

    @Prop({ type: Object, required: true })
    location: {
        city: string;
        area: string;
    };

    @Prop({ required: true })
    requiredDate: Date;

    @Prop({ required: true })
    expiresAt: Date;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    assignedDonorId: User;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    hospitalId: User;
}

export const BloodRequestSchema = SchemaFactory.createForClass(BloodRequest);
