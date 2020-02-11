import * as path from 'path';
import * as http from 'http';
import * as express from 'express';
import * as compression from 'compression';
import { Container } from 'typedi';
import { createExpressServer } from 'routing-controllers';
import Authenticator from './Authenticator';
const authenticator = Container.get(Authenticator);

/**
 * Create http server
 * @param {number} port Define port number
 * @returns {http.Server} Http server
 */
export default function createHttpServer(port: number): http.Server {
    const app: express.Express = createExpressServer({
        cors: {
            origin: '*',
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
            allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'X-Api-Version'],
            maxAge: 3600,
            preflightContinue: true,
            optionsSuccessStatus: 204
        },
        routePrefix: '/api',
        controllers: [
            path.join(__dirname, '../controllers/*{.js,.ts}')
        ],
        middlewares: [
            path.join(__dirname, '../middlewares/*{.js,.ts}')
        ],
        validation: false,
        defaultErrorHandler: false,
        authorizationChecker: authenticator.authorizationHttpChecker,
        currentUserChecker: authenticator.currentUserChecker
    });

    app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));
    app.use(compression({ filter: (req, res) => req.headers['x-no-compression'] ? false : compression.filter(req, res) }));
    return app.listen(port);
}
