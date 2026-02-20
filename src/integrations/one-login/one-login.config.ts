import type { OneLoginConfiguration } from './one-login.interface';

function normalizeBaseUri(uri: string): string {
    const s = (uri ?? '').trim();
    return s.endsWith('/') ? s.slice(0, -1) : s;
}

export function getOneLoginConfig(): OneLoginConfiguration {
    const oidcBaseUri = normalizeBaseUri(process.env.ONELOGIN_BASE_URI ?? '');
    const tokenEndpoint = process.env.ONELOGIN_TOKEN_ENDPOINT?.trim() || undefined;
    const logoutUrl = process.env.ONELOGIN_LOGOUT_URL?.trim() || undefined;
    const postLogoutRedirectUri = process.env.ONELOGIN_POST_LOGOUT_REDIRECT_URI?.trim() || undefined;

    return {
        oidcBaseUri,
        clientId: process.env.ONELOGIN_CLIENT_ID ?? '',
        clientSecret: process.env.ONELOGIN_CLIENT_SECRET ?? '',
        redirectUri: process.env.ONELOGIN_REDIRECT_URI ?? '',
        tokenEndpoint: tokenEndpoint || (oidcBaseUri ? `${oidcBaseUri}/oidc/2/token` : undefined),
        logoutUrl: logoutUrl || (oidcBaseUri ? `${oidcBaseUri}/oidc/2/logout` : undefined),
        postLogoutRedirectUri,
    };
}
