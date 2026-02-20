import { Injectable } from '@nestjs/common';
import { OneLoginService } from '../../../integrations/one-login';
import type { AuthCallbackParams, AuthLoginUrlResult, AuthStrategy, AuthTokenResult } from '../auth.interface';

@Injectable()
export class OneLoginAuthStrategy implements AuthStrategy {
    static readonly STRATEGY_ID = 'onelogin';

    constructor(private readonly oneLogin: OneLoginService) {}

    getStrategyId(): string {
        return OneLoginAuthStrategy.STRATEGY_ID;
    }

    isAvailable(): boolean {
        return this.oneLogin.isAvailable();
    }

    async getLoginUrl(): Promise<AuthLoginUrlResult> {
        return this.oneLogin.getLoginUrl();
    }

    async redeemCode(params: AuthCallbackParams): Promise<AuthTokenResult> {
        const result = await this.oneLogin.redeemCode(
            params.code,
            params.state,
            params.codeVerifier,
        );
        return {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            expiresOn: result.expiresOn,
            tokenType: result.tokenType,
        };
    }
}
