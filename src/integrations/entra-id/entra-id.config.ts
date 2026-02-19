export interface EntraIdConfiguration {
    clientId: string;
    clientSecret: string;
    tenantId: string;
    redirectUri: string;
}

export function getEntraIdConfig(): EntraIdConfiguration {
    return {
        clientId: process.env.ENTRA_CLIENT_ID ?? '',
        clientSecret: process.env.ENTRA_CLIENT_SECRET ?? '',
        tenantId: process.env.ENTRA_TENANT_ID ?? '',
        redirectUri: process.env.ENTRA_REDIRECT_URI ?? '',
    };
}
