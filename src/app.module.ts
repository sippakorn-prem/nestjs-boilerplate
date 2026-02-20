import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { AuthGuard } from './common/guards';
import { RequestIdMiddleware } from './common/middleware';
import configuration from './config/configuration';
import { envValidationSchema } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { EntraIdModule } from './integrations/entra-id';
import { FtpModule } from './integrations/ftp';
import { SmtpModule } from './integrations/smtp';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { SampleModule } from './modules/sample/sample.module';

const nodeEnv = process.env.NODE_ENV || 'development';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [configuration],
            validationSchema: envValidationSchema,
            envFilePath: ['.env', `.env.${nodeEnv}`],
        }),
        DatabaseModule,
        SmtpModule,
        FtpModule,
        EntraIdModule,
        AuthModule,
        HealthModule,
        SampleModule,
    ],
    controllers: [],
    providers: [
        { provide: APP_GUARD, useClass: AuthGuard },
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void {
        consumer.apply(RequestIdMiddleware).forRoutes('*');
    }
}
