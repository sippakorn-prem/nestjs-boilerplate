import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters';
import { ResponseTransformInterceptor } from './common/interceptors';

async function bootstrap() {
    const logger = new Logger('Main');
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api', { exclude: ['onelogin/callback'] });
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new ResponseTransformInterceptor());
    const config = app.get(ConfigService);
    const port = config.get<number>('port') ?? 3000;
    await app.listen(port);
    logger.verbose(`🚀 Application is running on: ${await app.getUrl()}`);
}

void bootstrap();
