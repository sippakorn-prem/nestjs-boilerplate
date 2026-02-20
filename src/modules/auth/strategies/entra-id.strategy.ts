import { Injectable } from '@nestjs/common';
import { EntraIdService } from '../../../integrations/entra-id';
import type { AuthCallbackParams, AuthLoginUrlResult, AuthStrategy, AuthTokenResult } from '../auth.interface';

@Injectable()
export class EntraIdAuthStrategy implements AuthStrategy {
    static readonly STRATEGY_ID = 'entra';

    constructor(private readonly entraId: EntraIdService) {}

    getStrategyId(): string {
        return EntraIdAuthStrategy.STRATEGY_ID;
    }

    isAvailable(): boolean {
        return this.entraId.isAvailable();
    }

    async getLoginUrl(): Promise<AuthLoginUrlResult> {
        return this.entraId.getLoginUrl();
    }

    async redeemCode(params: AuthCallbackParams): Promise<AuthTokenResult> {
        const result = await this.entraId.redeemCode(
            params.code,
            params.state,
            params.codeVerifier,
        );
        return {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            expiresOn: result.expiresOn,
            tokenType: 'Bearer',
            idToken: result.idToken,
            idTokenClaims: result.idTokenClaims,
        };
    }
}
