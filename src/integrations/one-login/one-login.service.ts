import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { inspect } from 'node:util';
import type {
    OneLoginConfiguration,
    OneLoginLoginUrlResult,
    OneLoginTokenResult,
} from './one-login.interface';

const DEFAULT_SCOPES = ['openid', 'profile', 'email'];

@Injectable()
export class OneLoginService {
    private readonly logger = new Logger(OneLoginService.name);
    private config: OneLoginConfiguration;
    private pkceVerifiers = new Map<string, string>();

    constructor(private readonly configService: ConfigService) {
        this.config =
            this.configService.get<OneLoginConfiguration>('oneLogin') ?? {
                oidcBaseUri: '',
                clientId: '',
                clientSecret: '',
                redirectUri: '',
            };
    }

    isAvailable(): boolean {
        return Boolean(
            this.config.oidcBaseUri &&
                this.config.clientId &&
                this.config.clientSecret &&
                this.config.redirectUri,
        );
    }

    /**
     * Generate login URL for OIDC authorization code flow with PKCE.
     */
    async getLoginUrl(scopes: string[] = DEFAULT_SCOPES): Promise<OneLoginLoginUrlResult> {
        const crypto = await import('node:crypto');
        const state = crypto.randomBytes(16).toString('hex');
        const codeVerifier = crypto.randomBytes(32).toString('base64url');
        const codeChallenge = crypto
            .createHash('sha256')
            .update(codeVerifier)
            .digest('base64url');

        const params = new URLSearchParams({
            client_id: this.config.clientId,
            redirect_uri: this.config.redirectUri,
            response_type: 'code',
            scope: scopes.join(' '),
            state,
            code_challenge: codeChallenge,
            code_challenge_method: 'S256',
        });

        const authPath = '/oidc/2/auth';
        const baseUri = this.config.oidcBaseUri.replace(/\/$/, '');
        const url = `${baseUri}${authPath}?${params.toString()}`;
        this.pkceVerifiers.set(state, codeVerifier);
        return { url, state, codeVerifier };
    }

    /**
     * Exchange authorization code for tokens using PKCE.
     */
    async redeemCode(
        code: string,
        state: string,
        codeVerifier?: string,
    ): Promise<OneLoginTokenResult> {
        const verifier = codeVerifier ?? this.pkceVerifiers.get(state);
        if (!verifier) {
            throw new Error('Invalid state or missing code_verifier. Restart login flow.');
        }

        const tokenUrl = this.config.tokenEndpoint ?? `${this.config.oidcBaseUri}/oidc/2/token`;
        const body = new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: this.config.clientId,
            client_secret: this.config.clientSecret,
            redirect_uri: this.config.redirectUri,
            code,
            code_verifier: verifier,
        });

        const res = await fetch(tokenUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString(),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`OneLogin token request failed: ${res.status} ${text}`);
        }

        const data = (await res.json()) as {
            access_token: string;
            refresh_token?: string;
            expires_in?: number;
            token_type?: string;
        };

        this.logger.log(
            `OneLogin OAuth token response ${inspect(data, { colors: true, compact: false })}`,
        );

        this.pkceVerifiers.delete(state);

        const expiresOn = data.expires_in
            ? new Date(Date.now() + data.expires_in * 1000)
            : new Date();

        return {
            accessToken: data.access_token ?? '',
            refreshToken: data.refresh_token,
            expiresOn,
            tokenType: data.token_type ?? 'Bearer',
        };
    }

    /**
     * Build IdP logout URL. Optional: include post_logout_redirect_uri if configured.
     */
    getLogoutUrl(idTokenHint?: string): string {
        const logoutUrl = this.config.logoutUrl ?? `${this.config.oidcBaseUri}/oidc/2/logout`;
        const params = new URLSearchParams();
        if (this.config.clientId) {
            params.set('client_id', this.config.clientId);
        }
        if (this.config.postLogoutRedirectUri) {
            params.set('post_logout_redirect_uri', this.config.postLogoutRedirectUri);
        }
        if (idTokenHint) {
            params.set('id_token_hint', idTokenHint);
        }
        const query = params.toString();
        return query ? `${logoutUrl}?${query}` : logoutUrl;
    }
}
