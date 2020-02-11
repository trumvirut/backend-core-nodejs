import * as path from 'path';
import * as http from 'http';
import { Container } from 'typedi';
import * as socketIO from 'socket.io';
import * as socketIORedis from 'socket.io-redis';
import * as socketIOEmitter from 'socket.io-emitter';
import { useSocketServer } from 'socket-controllers';

/**
 * Create socket server
 * @param {http.Server} app Http server
 * @returns {socket.Server} Socket server
 */
export default function createSocketServer(server: http.Server): socketIO.Server {
    const io = socketIO(server, { origins: '*:*' });
    io.adapter(socketIORedis({
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT)
    }));

    const socketServer = useSocketServer(io, {
        controllers: [
            path.join(__dirname, '../socket-controllers/*{.js,.ts}')
        ]
    });

    const socketEmitter = socketIOEmitter({
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT)
    });
    Container.set('socket.io-emitter', socketEmitter);

    return socketServer;
}
