import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { REQUEST_ID_HEADER } from '../constants/http.constant';

declare global {
    namespace Express {
        interface Request {
            requestId?: string;
        }
    }
}

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction): void {
        const id =
            (req.headers[REQUEST_ID_HEADER] as string | undefined)?.trim() || randomUUID();
        req.requestId = id;
        res.setHeader(REQUEST_ID_HEADER, id);
        next();
    }
}
