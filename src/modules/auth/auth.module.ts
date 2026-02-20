import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { OneLoginCallbackController } from './onelogin-callback.controller';
import { AuthService } from './auth.service';
import { AUTH_STRATEGIES } from './auth.constant';
import { EntraIdAuthStrategy } from './strategies/entra-id.strategy';
import { OneLoginAuthStrategy } from './strategies/onelogin.strategy';

@Module({
    controllers: [AuthController, OneLoginCallbackController],
    providers: [
        EntraIdAuthStrategy,
        OneLoginAuthStrategy,
        {
            provide: AUTH_STRATEGIES,
            useFactory: (entraId: EntraIdAuthStrategy, oneLogin: OneLoginAuthStrategy) => [
                entraId,
                oneLogin,
            ],
            inject: [EntraIdAuthStrategy, OneLoginAuthStrategy],
        },
        AuthService,
    ],
    exports: [AuthService],
})
export class AuthModule {}
