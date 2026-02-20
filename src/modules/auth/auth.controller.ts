import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { Public } from '../../common/decorators';
import { AuthService } from './auth.service';

@Public()
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
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
     * GET /api/auth/:strategy/login
     * Returns JSON with login URL and PKCE state/codeVerifier.
     * Strategy examples: entra, (future: google, github).
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
        | { accessToken: string; refreshToken?: string; expiresOn: string; tokenType: string }
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
            const fragment = new URLSearchParams({
                access_token: result.accessToken,
                expires_on: result.expiresOn.toISOString(),
                token_type: result.tokenType,
                ...(result.refreshToken && { refresh_token: result.refreshToken }),
            }).toString();
            res.redirect(302, `${redirectUri}#${fragment}`);
            return;
        }

        return {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            expiresOn: result.expiresOn.toISOString(),
            tokenType: result.tokenType,
        };
    }
}
