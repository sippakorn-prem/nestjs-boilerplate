import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Controller, Get, NotFoundException, Param, Query, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { Public } from '../../common/decorators';
import { OneLoginService } from '../../integrations/one-login';
import { AuthService } from './auth.service';

@Public()
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
        private readonly oneLoginService: OneLoginService,
    ) {}

    /**
     * GET /api/auth/demo – demo page for Entra ID login flow.
     * Set CLIENT_REDIRECT_URI to this URL so callback redirects back here with token in hash.
     */
    @Get('demo')
    demo(@Res() res: Response): void {
        const path = join(process.cwd(), 'public', 'demo.html');
        const html = readFileSync(path, 'utf-8');
        res.type('text/html').send(html);
    }

    /**
     * GET /api/auth/:strategy/logout
     * For onelogin: redirects to IdP logout (optional ?id_token_hint= for RP-initiated logout).
     */
    @Get(':strategy/logout')
    logout(
        @Param('strategy') strategy: string,
        @Query('id_token_hint') idTokenHint: string | undefined,
        @Res() res: Response,
    ): void {
        if (strategy !== 'onelogin' || !this.oneLoginService.isAvailable()) {
            throw new NotFoundException(`Logout not supported for strategy: ${strategy}`);
        }
        const url = this.oneLoginService.getLogoutUrl(idTokenHint);
        res.redirect(302, url);
    }

    /**
     * GET /api/auth/:strategy/login
     * Returns JSON with login URL and PKCE state/codeVerifier.
     * Strategy examples: entra, onelogin.
     */
    @Get(':strategy/login')
    async login(
        @Param('strategy') strategy: string,
    ): Promise<{ url: string; state: string; codeVerifier?: string }> {
        return this.authService.getLoginUrl(strategy);
    }

    /**
     * GET /api/auth/:strategy/callback?code=...&state=...&code_verifier=...
     * Callback for OAuth. All query params are passed to the strategy (code, state, code_verifier, and any provider-specific params).
     * Returns tokens as JSON.
     */
    @Get(':strategy/callback')
    async callback(
        @Param('strategy') strategy: string,
        @Query() query: Record<string, string | undefined>,
        @Res({ passthrough: true }) res: Response,
    ): Promise<
        | {
              accessToken: string;
              refreshToken?: string;
              expiresOn: string;
              tokenType: string;
              idToken?: string;
              idTokenClaims?: Record<string, unknown>;
          }
        | undefined
    > {
        const code = query['code'];
        const state = query['state'];
        if (!code || !state) {
            res.status(400);
            return {
                accessToken: '',
                expiresOn: new Date().toISOString(),
                tokenType: 'Bearer',
            };
        }
        const params = {
            ...query,
            code,
            state,
            codeVerifier: query['code_verifier'] ?? query['codeVerifier'],
        };
        const result = await this.authService.redeemCode(strategy, params);

        const redirectUri = this.configService.get<string>('clientRedirectUri');
        if (redirectUri) {
            const fragmentParams: Record<string, string> = {
                access_token: result.accessToken,
                expires_on: result.expiresOn.toISOString(),
                token_type: result.tokenType,
                ...(result.refreshToken && { refresh_token: result.refreshToken }),
                ...(result.idToken && { id_token: result.idToken }),
                ...(result.idTokenClaims && {
                    id_token_claims: JSON.stringify(result.idTokenClaims),
                }),
            };
            const fragment = new URLSearchParams(fragmentParams).toString();
            res.redirect(302, `${redirectUri}#${fragment}`);
            return;
        }

        return {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            expiresOn: result.expiresOn.toISOString(),
            tokenType: result.tokenType,
            idToken: result.idToken,
            idTokenClaims: result.idTokenClaims,
        };
    }
}
