import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
    private transporter;

    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com',
            port: this.configService.get<number>('SMTP_PORT') || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: this.configService.get<string>('SMTP_USER'),
                pass: this.configService.get<string>('SMTP_PASS'),
            },
        });
    }

    async sendMail(to: string, subject: string, text: string, html?: string) {
        const info = await this.transporter.sendMail({
            from: '"Blood Donation App" <' + this.configService.get<string>('SMTP_USER') + '>',
            to,
            subject,
            text,
            html,
        });
        console.log('Message sent: %s', info.messageId);
        return info;
    }
}
