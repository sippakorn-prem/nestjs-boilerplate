import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfidentialClientApplication, type AuthenticationResult } from '@azure/msal-node';
import { inspect } from 'node:util';
import type { EntraIdConfiguration, EntraLoginUrlResult, EntraTokenResult } from './entra-id.interface';

@Injectable()
export class EntraIdService {
    private readonly logger = new Logger(EntraIdService.name);
    private config: EntraIdConfiguration;
    private app: ConfidentialClientApplication | null = null;
    private pkceVerifiers = new Map<string, string>();

    constructor(private readonly configService: ConfigService) {
        this.config =
            this.configService.get<EntraIdConfiguration>('entraId') ?? {
                clientId: '',
                clientSecret: '',
                tenantId: '',
                redirectUri: '',
            };
        if (this.isAvailable()) {
            this.app = new ConfidentialClientApplication({
                auth: {
                    clientId: this.config.clientId,
                    clientSecret: this.config.clientSecret,
                    authority: `https://login.microsoftonline.com/${this.config.tenantId}`,
                },
            });
        }
    }

    isAvailable(): boolean {
        return Boolean(
            this.config.clientId &&
                this.config.clientSecret &&
                this.config.tenantId &&
                this.config.redirectUri,
        );
    }

    private getApp(): ConfidentialClientApplication {
        if (!this.app) {
            throw new Error(
                'Microsoft Entra ID is not configured. Set ENTRA_CLIENT_ID, ENTRA_CLIENT_SECRET, ENTRA_TENANT_ID, ENTRA_REDIRECT_URI in .env',
            );
        }
        return this.app;
    }

    /**
     * Generate login URL for authorization code flow (PKCE).
     * Store state and codeVerifier in session/cache and pass codeVerifier to redeemCode after redirect.
     */
    async getLoginUrl(scopes: string[] = ['openid', 'profile', 'User.Read']): Promise<EntraLoginUrlResult> {
        const crypto = await import('node:crypto');
        const state = crypto.randomBytes(16).toString('hex');
        const codeVerifier = crypto.randomBytes(32).toString('base64url');
        const codeChallenge = crypto
            .createHash('sha256')
            .update(codeVerifier)
            .digest('base64url');

        const authCodeUrlParameters = {
            scopes,
            state,
            codeChallenge,
            codeChallengeMethod: 'S256',
            redirectUri: this.config.redirectUri,
        };

        const url = await this.getApp().getAuthCodeUrl(authCodeUrlParameters);
        this.pkceVerifiers.set(state, codeVerifier);
        return { url, state, codeVerifier };
    }

    /**
     * Exchange authorization code for tokens.
     * codeVerifier must match the one used when generating the login URL (e.g. from session).
     */
    async redeemCode(
        code: string,
        state: string,
        codeVerifier?: string,
    ): Promise<EntraTokenResult> {
        const verifier = codeVerifier ?? this.pkceVerifiers.get(state);
        if (!verifier) {
            throw new Error('Invalid state or missing code_verifier. Restart login flow.');
        }

        const result = await this.getApp().acquireTokenByCode({
            code,
            scopes: ['openid', 'profile', 'User.Read'],
            redirectUri: this.config.redirectUri,
            codeVerifier: verifier,
        });

        if (result) {
            this.pkceVerifiers.delete(state);
        }

        const authResult = result as AuthenticationResult & { refreshToken?: string };
        this.logger.log(
            `Entra ID OAuth token response ${inspect(authResult, { colors: true, compact: false })}`,
        );
        return {
            accessToken: authResult.accessToken ?? '',
            refreshToken: authResult.refreshToken,
            expiresOn: authResult.expiresOn ?? new Date(),
            scopes: authResult.scopes ?? [],
        };
    }
}
