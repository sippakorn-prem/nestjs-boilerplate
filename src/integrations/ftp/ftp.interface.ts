export interface FtpConfiguration {
    host: string;
    port: number;
    user: string;
    password: string;
    secure: boolean;
}

export interface FtpConnectionOptions {
    host: string;
    port: number;
    user: string;
    password: string;
    secure?: boolean;
}
