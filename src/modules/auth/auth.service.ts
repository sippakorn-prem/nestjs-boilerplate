import { Inject, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import type { AuthCallbackParams, AuthLoginUrlResult, AuthStrategy, AuthTokenResult } from './auth.interface';
import { AUTH_STRATEGIES } from './auth.constant';

@Injectable()
export class AuthService {
    constructor(
        @Inject(AUTH_STRATEGIES) private readonly strategies: AuthStrategy[],
    ) {}

    /** Get list of registered strategy ids (for discovery / docs) */
    getStrategyIds(): string[] {
        return this.strategies.map((s) => s.getStrategyId());
    }

    /** Get a strategy by id; throws if not found or not available */
    private getStrategy(strategyId: string): AuthStrategy {
        const strategy = this.strategies.find((s) => s.getStrategyId() === strategyId);
        if (!strategy) {
            throw new NotFoundException(`Unknown auth strategy: ${strategyId}`);
        }
        if (!strategy.isAvailable()) {
            throw new ServiceUnavailableException(
                `Auth strategy "${strategyId}" is not configured. Set required env vars for this provider.`,
            );
        }
        return strategy;
    }

    async getLoginUrl(strategyId: string): Promise<AuthLoginUrlResult> {
        return this.getStrategy(strategyId).getLoginUrl();
    }

    async redeemCode(strategyId: string, params: AuthCallbackParams): Promise<AuthTokenResult> {
        return this.getStrategy(strategyId).redeemCode(params);
    }
}
