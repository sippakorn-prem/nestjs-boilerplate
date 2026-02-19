import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AUTH_STRATEGIES } from './auth.constant';
import { EntraIdAuthStrategy } from './strategies/entra-id.strategy';

@Module({
    controllers: [AuthController],
    providers: [
        EntraIdAuthStrategy,
        {
            provide: AUTH_STRATEGIES,
            useFactory: (entraId: EntraIdAuthStrategy) => [entraId],
            inject: [EntraIdAuthStrategy],
        },
        AuthService,
    ],
    exports: [AuthService],
})
export class AuthModule {}
