export interface SmtpConfiguration {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
    from: string;
}

export interface SendMailOptions {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    from?: string;
    replyTo?: string;
    cc?: string | string[];
    bcc?: string | string[];
}
