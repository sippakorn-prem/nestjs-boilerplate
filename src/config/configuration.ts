import { getEntraIdConfig } from '../integrations/entra-id/entra-id.config';
import { getFtpConfig } from '../integrations/ftp/ftp.config';
import { getSmtpConfig } from '../integrations/smtp/smtp.config';

export interface AppConfiguration {
    port: number;
    nodeEnv: string;
    databaseUrl: string;
    /** Optional. After OAuth callback, redirect here with token in URL fragment. */
    clientRedirectUri: string;
    smtp: ReturnType<typeof getSmtpConfig>;
    ftp: ReturnType<typeof getFtpConfig>;
    entraId: ReturnType<typeof getEntraIdConfig>;
}

export default (): AppConfiguration => {
    return {
        port: parseInt(process.env.PORT ?? '3000', 10),
        nodeEnv: process.env.NODE_ENV ?? 'development',
        databaseUrl: process.env.DATABASE_URL ?? '',
        clientRedirectUri: process.env.CLIENT_REDIRECT_URI ?? '',
        smtp: getSmtpConfig(),
        ftp: getFtpConfig(),
        entraId: getEntraIdConfig(),
    };
};
