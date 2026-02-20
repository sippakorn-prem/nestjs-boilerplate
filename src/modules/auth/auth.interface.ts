/**
 * Result of initiating a login flow (e.g. OAuth authorize URL + PKCE state/codeVerifier).
 */
export interface AuthLoginUrlResult {
    url: string;
    state: string;
    codeVerifier?: string;
}

/**
 * Result of redeeming an authorization code for tokens.
 */
export interface AuthTokenResult {
    accessToken: string;
    refreshToken?: string;
    expiresOn: Date;
    tokenType: string;
    /** Raw id_token from the IdP (JWT string). */
    idToken?: string;
    /** Decoded id_token payload (claims). */
    idTokenClaims?: Record<string, unknown>;
}

/**
 * Callback params from the OAuth redirect (query string).
 * Standard fields: code, state, codeVerifier (PKCE).
 * Strategies can read additional provider-specific keys from the same object.
 */
export interface AuthCallbackParams {
    code: string;
    state: string;
    codeVerifier?: string;
    [key: string]: string | undefined;
}

/**
 * Contract for an auth strategy (e.g. Entra ID, Google, GitHub).
 * Register implementations in AuthModule and they are discovered by strategy id.
 */
export interface AuthStrategy {
    /** Unique id used in routes, e.g. "entra", "google" */
    getStrategyId(): string;

    /** Whether this strategy is configured and usable */
    isAvailable(): boolean;

    /** Start login flow; returns URL to redirect user and optional PKCE data */
    getLoginUrl(): Promise<AuthLoginUrlResult>;

    /** Exchange callback params (code, state, codeVerifier, etc.) for tokens */
    redeemCode(params: AuthCallbackParams): Promise<AuthTokenResult>;
}
