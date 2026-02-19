export interface SmtpConfiguration {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
    from: string;
}

export function getSmtpConfig(): SmtpConfiguration {
    return {
        host: process.env.SMTP_HOST ?? 'localhost',
        port: parseInt(process.env.SMTP_PORT ?? '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        user: process.env.SMTP_USER ?? '',
        password: process.env.SMTP_PASSWORD ?? '',
        from: process.env.SMTP_FROM ?? 'noreply@localhost',
    };
}
