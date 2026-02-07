import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    ) { }

    async create(createNotificationDto: any): Promise<Notification> {
        const notification = new this.notificationModel(createNotificationDto);
        return notification.save();
    }

    async findByUser(userId: string): Promise<Notification[]> {
        return this.notificationModel.find({ userId }).sort({ createdAt: -1 }).exec();
    }

    async markAsRead(id: string): Promise<Notification | null> {
        return this.notificationModel.findByIdAndUpdate(id, { isRead: true }, { new: true }).exec();
    }
}
