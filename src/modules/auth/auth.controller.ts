import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

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
    ): Promise<{
        accessToken: string;
        refreshToken?: string;
        expiresOn: string;
        tokenType: string;
    }> {
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
        return {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            expiresOn: result.expiresOn.toISOString(),
            tokenType: result.tokenType,
        };
    }
}
