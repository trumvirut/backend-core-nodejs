import { Container } from 'typedi';
import ISocket from '../application/models/socket/ISocket';

export default class SocketHelper {
    static send(socket: ISocket, event: string, room: string, data: any): Boolean {
        const nsp = room ? socket.nsp.to(room) : socket.nsp;
        return nsp.emit(event, data);
    }

    static sendWithSender(socket: ISocket, event: string, room: string, data: any): Boolean {
        const nsp = room ? socket.nsp.to(room) : socket.nsp;
        socket.emit(event, data);
        return nsp.emit(event, data);
    }

    static sendByEmitter(namespace: string, event: string, room: string, data: any): Boolean {
        const socketEmitter: any = Container.get('socket.io-emitter');
        const nsp = room ? socketEmitter.of(namespace).to(room) : socketEmitter.of(namespace);
        return nsp.emit(event, data);
    }
}
