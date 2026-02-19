import { Injectable, type OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ftp from 'basic-ftp';
import type { FtpConfiguration, FtpConnectionOptions } from './ftp.interface';

@Injectable()
export class FtpService implements OnModuleDestroy {
    private config: FtpConfiguration;
    private client: ftp.Client | null = null;

    constructor(private readonly configService: ConfigService) {
        this.config =
            this.configService.get<FtpConfiguration>('ftp') ?? {
                host: '',
                port: 21,
                user: '',
                password: '',
                secure: false,
            };
    }

    isAvailable(): boolean {
        return Boolean(
            this.config.host &&
                this.config.user &&
                this.config.password,
        );
    }

    private getClient(): ftp.Client {
        if (!this.client) {
            this.client = new ftp.Client();
        }
        return this.client;
    }

    private getConfig(): FtpConnectionOptions {
        return {
            host: this.config.host,
            port: this.config.port,
            user: this.config.user,
            password: this.config.password,
            secure: this.config.secure,
        };
    }

    async connect(): Promise<ftp.Client> {
        if (!this.isAvailable()) {
            throw new Error('FTP is not configured. Set FTP_HOST, FTP_USER, FTP_PASSWORD in .env');
        }
        const client = this.getClient();
        const opts = this.getConfig();
        await client.access({
            host: opts.host,
            port: opts.port,
            user: opts.user,
            password: opts.password,
            secure: opts.secure ?? false,
        });
        return client;
    }

    async disconnect(): Promise<void> {
        if (this.client) {
            this.client.close();
            this.client = null;
        }
    }

    async upload(
        localPath: string,
        remotePath: string,
    ): Promise<void> {
        const client = await this.connect();
        try {
            await client.uploadFrom(localPath, remotePath);
        } finally {
            await this.disconnect();
        }
    }

    async download(
        remotePath: string,
        localPath: string,
    ): Promise<void> {
        const client = await this.connect();
        try {
            await client.downloadTo(localPath, remotePath);
        } finally {
            await this.disconnect();
        }
    }

    async list(remotePath = '.'): Promise<ftp.FileInfo[]> {
        const client = await this.connect();
        try {
            return await client.list(remotePath);
        } finally {
            await this.disconnect();
        }
    }

    async onModuleDestroy(): Promise<void> {
        await this.disconnect();
    }
}
