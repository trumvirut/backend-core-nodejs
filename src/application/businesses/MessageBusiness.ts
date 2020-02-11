import * as redis from 'redis';
import { Inject, Service } from 'typedi';
import Authenticator from '../../system/Authenticator';
import IMessageBusiness from './interfaces/IMessageBusiness';
import IUserBusiness from './interfaces/IUserBusiness';
import UserBusiness from './UserBusiness';
import ISocket from '../models/socket/ISocket';
import ContactView from '../models/socket/ContactView';
import MessageView from '../models/socket/MessageView';
import Pagination from '../models/common/Pagination';
import SocketHelper from '../../helpers/SocketHelper';
import { RoleCode } from '../models/common/Enum';
import { CommonError } from '../models/common/Error';
const redisClient = redis.createClient(Number(process.env.REDIS_PORT), process.env.REDIS_HOST);

@Service()
export default class MessageBusiness implements IMessageBusiness {
    @Inject(() => Authenticator)
    private authenticator: Authenticator;

    @Inject(() => UserBusiness)
    private userBusiness: IUserBusiness;

    async connect(socket: ISocket): Promise<ISocket> {
        const currentUser = await this.authenticator.authenticateBySocket(socket);

        if (!currentUser)
            socket.disconnect(true);
        else {
            const user: ContactView = currentUser;
            user.isOnline = true;

            socket.join(currentUser.id.toString(), err => {
                if (err) console.error('Join individual room', err);
            });

            socket.join('0', err => {
                if (err) console.error('Join main room', err);
            });

            socket.user = user;
            if (user.role.code !== RoleCode.Administrator)
                socket.broadcast.emit('contact_status', user);
        }
        return socket;
    }

    disconnect(socket: ISocket): void {
        if (socket.user) {
            socket.user.isOnline = false;
            if (socket.user.role.code !== RoleCode.Administrator)
                socket.broadcast.emit('contact_status', socket.user);
        }
    }

    async findContacts(socket: ISocket, keyword?: string, skip?: number, limit?: number): Promise<ContactView[]> {
        const { results } = await this.userBusiness.findUsers(keyword, skip, limit);
        const contacts = results.map((user: ContactView) => {
            user.isOnline = false;
            user.hasNewMessage = false;
            return user;
        });

        const sockets = Object.values(socket.nsp.sockets);
        contacts.forEach(user => {
            for (let i = 0; i < sockets.length; i++) {
                const sock: ISocket = sockets[i];
                if (sock.connected && sock.user && sock.user.id === user.id) {
                    user.isOnline = true;
                    break;
                }
            }
        });

        const contactIds = await this.getMessageStatus(socket.user!.id);
        contactIds.forEach(contactId => {
            const contact = contacts.find(contact => contact.id === contactId);
            if (contact)
                contact.hasNewMessage = true;
        });

        return contacts;
    }

    findMessages(socket: ISocket, room: number, skip?: number, limit?: number): Promise<MessageView[]> {
        return new Promise((resolve, reject) => {
            const pagination = new Pagination(skip, limit, 50);
            redisClient.zrangebyscore('message', room, room, 'LIMIT', pagination.skip, pagination.limit, (err, response) => {
                if (err)
                    return reject(err);

                let senderId;
                const results: MessageView[] = [];
                for (let i = 0; i < response.length; i++) {
                    const item = JSON.parse(response[i]) as MessageView;
                    const message = new MessageView();
                    message.senderId = item.senderId;
                    message.receiverId = item.receiverId;
                    message.room = item.room;
                    message.code = item.code;
                    message.time = item.time;
                    message.content = item.content;
                    results.push(message);

                    if (!senderId && message.senderId)
                        senderId = message.senderId;
                }
                this.deleteMessageStatus(socket, socket.user!.id, senderId || room);
                resolve(results);
            });
        });
    }

    createMessage(socket: ISocket, data: MessageView): Promise<MessageView> {
        return new Promise((resolve, reject) => {
            const message = new MessageView();
            message.senderId = socket.user!.id;
            message.receiverId = data.receiverId;
            message.code = data.code;
            message.time = Date.now();
            message.content = data.content;

            if (!message.senderId || !message.receiverId || !message.code || !message.content)
                throw new CommonError();

            const generateId = function(num) {
                if (num.toString().length >= 7)
                    return num.toString();
                return (num * Number('1'.padEnd(8 - num.toString().length, '0'))).toString();
            };

            if (message.senderId > message.receiverId)
                message.room = Number(generateId(message.senderId) + generateId(message.receiverId));
            else
                message.room = Number(generateId(message.receiverId) + generateId(message.senderId));

            redisClient.zadd('message', message.room, JSON.stringify(message), (err, response) => {
                if (err)
                    return reject(err);

                SocketHelper.sendWithSender(socket, 'message_directly', message.receiverId!.toString(), message);
                this.createMessageStatus(socket, message.senderId, message.receiverId);
                resolve(message);
            });
        });
    }

    createMessageRoom(socket: ISocket, data: MessageView): Promise<MessageView> {
        return new Promise((resolve, reject) => {
            const message = new MessageView();
            message.senderId = socket.user!.id;
            message.room = data.room;
            message.code = data.code;
            message.time = Date.now();
            message.content = data.content;

            if (!message.senderId || !message.code || (!message.room && message.room !== 0) || !message.content)
                throw new CommonError();

            redisClient.zadd('message', message.room, JSON.stringify(message), (err, response) => {
                if (err)
                    return reject(err);

                SocketHelper.sendWithSender(socket, 'message_room', message.room.toString(), message);
                this.createMessageStatus(socket, message.senderId, message.room);
                resolve(message);
            });
        });
    }

    private getMessageStatus(userId: number): Promise<number[]> {
        return new Promise((resolve, reject) => {
            redisClient.hget('message_status', userId.toString(), (err, response) => {
                if (err)
                    return reject(err);

                const list = !response ? [] : JSON.parse(response) as number[];
                resolve(list);
            });
        });
    }

    private createMessageStatus(socket: ISocket, senderId: number, receiverId: number = 0): Promise<void> {
        return new Promise((resolve, reject) => {
            redisClient.hget('message_status', receiverId.toString(), (err, response) => {
                if (err)
                    return reject(err);

                let list;
                if (receiverId) {
                    list = !response ? [] : JSON.parse(response);
                    if (list.indexOf(senderId) === -1) {
                        list.push(senderId);
                        redisClient.hset('message_status', receiverId.toString(), JSON.stringify(list), (err, response) => {
                            if (err)
                                return reject(err);

                            resolve();
                        });
                    }
                }
                else { // 0 is room
                    list = [senderId];
                    redisClient.hset('message_status', receiverId.toString(), JSON.stringify(list), (err, response) => {
                        if (err)
                            return reject(err);

                        resolve();
                    });
                }
            });
        });
    }

    private deleteMessageStatus(socket: ISocket, receiverId: number, room: number): Promise<void> {
        return new Promise((resolve, reject) => {
            redisClient.hget('message_status', receiverId.toString(), (err, response) => {
                if (err)
                    return reject(err);

                const list = !response ? [] : JSON.parse(response);
                if (list.indexOf(room) !== -1) {
                    list.splice(list.indexOf(room), 1);
                    redisClient.hset('message_status', receiverId.toString(), JSON.stringify(list), (err, response) => {
                        if (err)
                            return reject(err);
                        resolve();
                    });
                }
            });
        });
    }
};
