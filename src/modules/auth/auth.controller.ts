import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    /**
     * GET /api/auth/entra/login
     * Returns JSON with login URL and PKCE state/codeVerifier.
     * For redirect-based flow, redirect user to the returned URL; store state and codeVerifier for callback.
     */
    @Get('entra/login')
    async entraLogin(): Promise<{ url: string; state: string; codeVerifier: string }> {
        return this.authService.getEntraLoginUrl();
    }

    /**
     * GET /api/auth/entra/callback?code=...&state=...
     * Callback for Entra ID. Pass code and state from query; codeVerifier must come from session if you use one.
     * Returns tokens as JSON. For browser flow you may redirect to frontend with tokens in query/fragment.
     */
    @Get('entra/callback')
    async entraCallback(
        @Query('code') code: string | undefined,
        @Query('state') state: string | undefined,
        @Query('code_verifier') codeVerifier: string | undefined,
        @Res({ passthrough: true }) res: Response,
    ): Promise<{
        accessToken: string;
        refreshToken?: string;
        expiresOn: string;
        tokenType: string;
    }> {
        if (!code || !state) {
            res.status(400);
            return {
                accessToken: '',
                expiresOn: new Date().toISOString(),
                tokenType: 'Bearer',
            };
        }
        const result = await this.authService.redeemEntraCode(code, state, codeVerifier);
        return {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            expiresOn: result.expiresOn.toISOString(),
            tokenType: result.tokenType,
        };
    }
}
