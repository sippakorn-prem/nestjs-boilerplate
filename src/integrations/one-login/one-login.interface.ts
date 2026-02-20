export interface OneLoginConfiguration {
    /** OIDC base URI (e.g. https://xx.onelogin.com) */
    oidcBaseUri: string;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    /** Token endpoint; defaults to {oidcBaseUri}/oidc/2/token */
    tokenEndpoint?: string;
    /** Logout URL; defaults to {oidcBaseUri}/oidc/2/logout */
    logoutUrl?: string;
    /** Where to send user after IdP logout */
    postLogoutRedirectUri?: string;
}

export interface OneLoginLoginUrlResult {
    url: string;
    state: string;
    codeVerifier: string;
}

export interface OneLoginTokenResult {
    accessToken: string;
    refreshToken?: string;
    expiresOn: Date;
    tokenType: string;
    /** Raw id_token (JWT). */
    idToken?: string;
    /** Decoded id_token claims. */
    idTokenClaims?: Record<string, unknown>;
}
