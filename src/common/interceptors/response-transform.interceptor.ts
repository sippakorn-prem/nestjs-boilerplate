import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { REQUEST_ID_HEADER } from '../constants/http.constant';

export interface TransformedResponse<T = unknown> {
    requestId?: string;
    timestamp: string;
    data: T;
}

@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<unknown> {
        const req = context.switchToHttp().getRequest<Request>();
        const requestId =
            (req as Request & { requestId?: string }).requestId ??
            (req.headers[REQUEST_ID_HEADER] as string | undefined);

        return next.handle().pipe(
            map((value) => {
                const res = context.switchToHttp().getResponse();
                if (res.headersSent) return value;
                if (value === null || value === undefined) return value;
                if (
                    typeof value === 'object' &&
                    'data' in value &&
                    'meta' in value
                )
                    return value;
                return {
                    requestId,
                    timestamp: new Date().toISOString(),
                    data: value,
                } as TransformedResponse;
            }),
        );
    }
}
