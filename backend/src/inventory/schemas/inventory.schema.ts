import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type InventoryDocument = Inventory & Document;

@Schema({ timestamps: true })
export class Inventory {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    hospitalId: User;

    @Prop({ required: true })
    bloodGroup: string;

    @Prop({ required: true })
    units: number;

    @Prop({ required: true })
    expiryDate: Date;
}

export const InventorySchema = SchemaFactory.createForClass(Inventory);
