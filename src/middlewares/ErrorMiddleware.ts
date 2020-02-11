import { NextFunction, Request, Response } from 'express';
import { ExpressErrorMiddlewareInterface, HttpError, InternalServerError, Middleware } from 'routing-controllers';
import { QueryFailedError } from 'typeorm';

@Middleware({ type: 'after' })
export class ErrorMiddleware implements ExpressErrorMiddlewareInterface {
    error(err: HttpError, req: Request, res: Response, next: NextFunction) {
        if (err.name === QueryFailedError.name)
            err = new InternalServerError(err.message);

        if (JSON.parse(process.env.API_LOGGING || ''))
            console.error(err);

        res.status(err.httpCode || 500);
        res.send(err);
    }
};
