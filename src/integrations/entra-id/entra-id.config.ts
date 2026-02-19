import type { EntraIdConfiguration } from './entra-id.interface';

export function getEntraIdConfig(): EntraIdConfiguration {
    return {
        clientId: process.env.ENTRA_CLIENT_ID ?? '',
        clientSecret: process.env.ENTRA_CLIENT_SECRET ?? '',
        tenantId: process.env.ENTRA_TENANT_ID ?? '',
        redirectUri: process.env.ENTRA_REDIRECT_URI ?? '',
    };
}
