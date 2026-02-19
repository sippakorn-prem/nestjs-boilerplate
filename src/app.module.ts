import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import configuration from './config/configuration';
import { envValidationSchema } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { EntraIdModule } from './integrations/entra-id';
import { FtpModule } from './integrations/ftp';
import { SmtpModule } from './integrations/smtp';
import { AuthModule } from './modules/auth/auth.module';
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
        SampleModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
