import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Transporter } from 'nodemailer';
import * as nodemailer from 'nodemailer';
import type { SendMailOptions, SmtpConfiguration } from './smtp.interface';

@Injectable()
export class SmtpService {
    private transporter: Transporter | null = null;
    private config: SmtpConfiguration;

    constructor(private readonly configService: ConfigService) {
        this.config = this.configService.get<SmtpConfiguration>('smtp') ?? {
            host: '',
            port: 587,
            secure: false,
            user: '',
            password: '',
            from: 'noreply@localhost',
        };
        if (this.config.host && this.config.user) {
            this.transporter = nodemailer.createTransport({
                host: this.config.host,
                port: this.config.port,
                secure: this.config.secure,
                auth: {
                    user: this.config.user,
                    pass: this.config.password,
                },
            });
        }
    }

    isAvailable(): boolean {
        return this.transporter !== null;
    }

    async sendMail(options: SendMailOptions): Promise<void> {
        if (!this.transporter) {
            throw new Error('SMTP is not configured. Set SMTP_HOST and SMTP_USER in .env');
        }
        const to = Array.isArray(options.to) ? options.to.join(', ') : options.to;
        await this.transporter.sendMail({
            from: options.from ?? this.config.from,
            to,
            subject: options.subject,
            text: options.text,
            html: options.html,
            replyTo: options.replyTo,
            cc: options.cc,
            bcc: options.bcc,
        });
    }

    async verifyConnection(): Promise<boolean> {
        if (!this.transporter) return false;
        try {
            await this.transporter.verify();
            return true;
        } catch {
            return false;
        }
    }
}
