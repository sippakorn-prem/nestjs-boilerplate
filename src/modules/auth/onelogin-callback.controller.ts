import { Controller, Get, Query, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { Public } from '../../common/decorators';
import { AuthService } from './auth.service';

/**
 * Handles GET /onelogin/callback (no /api prefix).
 * Use this path as ONELOGIN_REDIRECT_URI when you cannot use /api/auth/onelogin/callback.
 */
@Public()
@Controller('onelogin')
export class OneLoginCallbackController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) {}

    @Get('callback')
    async callback(
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
        const result = await this.authService.redeemCode('onelogin', params);

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
