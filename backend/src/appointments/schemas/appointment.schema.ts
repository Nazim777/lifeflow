import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type AppointmentDocument = Appointment & Document;

@Schema({ timestamps: true })
export class Appointment {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    donorId: User;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    hospitalId: User;

    @Prop({ required: true })
    date: Date;

    @Prop({ required: true, enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rejected'], default: 'pending' })
    status: string;

    @Prop()
    notes: string;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
