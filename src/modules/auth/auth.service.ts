import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { EntraIdService } from '../../integrations/entra-id';

@Injectable()
export class AuthService {
    constructor(private readonly entraId: EntraIdService) {}

    async getEntraLoginUrl(): Promise<{ url: string; state: string; codeVerifier: string }> {
        if (!this.entraId.isAvailable()) {
            throw new ServiceUnavailableException(
                'Microsoft Entra ID login is not configured. Set ENTRA_* env vars.',
            );
        }
        return this.entraId.getLoginUrl();
    }

    async redeemEntraCode(
        code: string,
        state: string,
        codeVerifier?: string,
    ): Promise<{ accessToken: string; refreshToken?: string; expiresOn: Date; tokenType: string }> {
        if (!this.entraId.isAvailable()) {
            throw new ServiceUnavailableException(
                'Microsoft Entra ID login is not configured.',
            );
        }
        const result = await this.entraId.redeemCode(code, state, codeVerifier);
        return {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            expiresOn: result.expiresOn,
            tokenType: 'Bearer',
        };
    }
}
