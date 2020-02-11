import 'reflect-metadata';
import * as os from 'os';
import * as cluster from 'cluster';
import './system/Singleton';
import createHttpServer from './system/HttpServer';
import createSocketServer from './system/SocketServer';
import DataAccess from './application/dataAccess';

const port = process.env.PORT ? Number(process.env.PORT) : 80;
const useSocketServer: Boolean = JSON.parse(process.env.USE_SOCKET_SERVER || '');

if (process.env.NODE_ENV === 'development') {
    console.log('\n\nStarting project \x1b[32m' + process.env.PROJECT_NAME + '\x1b[0m with \x1b[32m' + process.env.NODE_ENV + '\x1b[0m mode....\n');
    DataAccess.createDBConnection().then(() => {
        const server = createHttpServer(port);
        console.log('Http server is ready', '\x1b[32m', 'http://localhost' + (port !== 80 ? ':' + port : ''), '\x1b[0m', !useSocketServer ? '\n' : '');

        if (useSocketServer) {
            createSocketServer(server);
            console.log('Socket server is ready', '\x1b[32m', 'http://localhost' + (port !== 80 ? ':' + port : ''), '\x1b[0m', '\n');
        }
    }).catch(error => console.log('\x1b[31m', error.message, '\x1b[0m'));
}
else {
    if (cluster.isMaster) {
        console.log('\n\nStarting project \x1b[32m' + process.env.PROJECT_NAME + '\x1b[0m....\n');
        console.log('Http server is ready', '\x1b[32m', 'http://localhost' + (port !== 80 ? ':' + port : ''), '\x1b[0m', !useSocketServer ? '\n' : '');
        if (useSocketServer)
            console.log('Socket server is ready', '\x1b[32m', 'http://localhost' + (port !== 80 ? ':' + port : ''), '\x1b[0m', '\n');

        const numCPUs = os.cpus().length;
        // Fork workers.
        for (let i = 0; i < numCPUs; i++)
            cluster.fork();

        cluster.on('exit', (worker, code, signal) => {
            cluster.fork();
            console.log(`Worker ${worker.process.pid} is died.`);
        });
        console.log(`Master ${process.pid} is started.`);
    }
    else {
        DataAccess.createDBConnection().then(() => {
            const server = createHttpServer(port);
            if (useSocketServer)
                createSocketServer(server);
            console.log(`Worker ${process.pid} is started.`);
        }).catch(error => {
            console.log('\x1b[31m', error.message, '\x1b[0m');
            setTimeout(() => process.exit(), 2000);
        });
    }
}
