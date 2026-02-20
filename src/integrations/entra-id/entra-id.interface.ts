export interface EntraIdConfiguration {
    clientId: string;
    clientSecret: string;
    tenantId: string;
    redirectUri: string;
}

export interface EntraLoginUrlResult {
    url: string;
    state: string;
    codeVerifier: string;
}

export interface EntraTokenResult {
    accessToken: string;
    refreshToken?: string;
    expiresOn: Date;
    scopes: string[];
    /** Raw id_token (JWT). */
    idToken?: string;
    /** Decoded id_token claims. */
    idTokenClaims?: Record<string, unknown>;
}
