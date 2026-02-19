import type { FtpConfiguration } from './ftp.interface';

export function getFtpConfig(): FtpConfiguration {
    return {
        host: process.env.FTP_HOST ?? 'localhost',
        port: parseInt(process.env.FTP_PORT ?? '21', 10),
        user: process.env.FTP_USER ?? '',
        password: process.env.FTP_PASSWORD ?? '',
        secure: process.env.FTP_SECURE === 'true',
    };
}
