import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { REQUEST_ID_HEADER } from '../constants/http.constant';

export interface HttpExceptionFilterPayload {
    statusCode: number;
    error: string;
    message: string | string[];
    requestId?: string;
    timestamp: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse<Response>();
        const req = ctx.getRequest<Request>();
        const requestId = (req as Request & { requestId?: string }).requestId ?? req.headers[REQUEST_ID_HEADER];

        const { statusCode, body } = this.normalize(exception);

        if (statusCode >= 500) {
            this.logger.error(
                `${req.method} ${req.url} ${statusCode}`,
                exception instanceof Error ? exception.stack : String(exception),
            );
        }

        const payload: HttpExceptionFilterPayload = {
            ...body,
            requestId: requestId as string | undefined,
            timestamp: new Date().toISOString(),
        };

        if (!res.headersSent) {
            res.status(statusCode).json(payload);
        }
    }

    private normalize(
        exception: unknown,
    ): { statusCode: number; body: Omit<HttpExceptionFilterPayload, 'requestId' | 'timestamp'> } {
        if (exception instanceof HttpException) {
            const status = exception.getStatus();
            const response = exception.getResponse();
            const message =
                typeof response === 'object' && response !== null && 'message' in response
                    ? (response as { message?: string | string[] }).message
                    : exception.message;
            return {
                statusCode: status,
                body: {
                    statusCode: status,
                    error: exception.name,
                    message: message ?? 'Unknown error',
                },
            };
        }

        const message = exception instanceof Error ? exception.message : 'Internal server error';
        return {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            body: {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                error: 'Internal Server Error',
                message,
            },
        };
    }
}
