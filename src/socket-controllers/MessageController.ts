import { Inject } from 'typedi';
import { Server } from 'socket.io';
import { ConnectedSocket, EmitOnFail, EmitOnSuccess, MessageBody, OnConnect, OnDisconnect, OnMessage, SkipEmitOnEmptyResult, SocketController, SocketIO } from 'socket-controllers';
import IMessageBusiness from '../application/businesses/interfaces/IMessageBusiness';
import MessageBusiness from '../application/businesses/MessageBusiness';
import MessageView from '../application/models/socket/MessageView';
import ISocket from '../application/models/socket/ISocket';

@SocketController('/message')
export default class RoleController {
    @Inject(() => MessageBusiness)
    private messageBusiness: IMessageBusiness;

    @OnConnect()
    connect(@SocketIO() io: Server, @ConnectedSocket() socket: ISocket) {
        return this.messageBusiness.connect(socket);
    }

    @OnDisconnect()
    disconnect(@ConnectedSocket() socket: ISocket) {
        this.messageBusiness.disconnect(socket);
    }

    @OnMessage('contact_list')
    @EmitOnFail('contact_list_error')
    @EmitOnSuccess('contact_list_successfully')
    @SkipEmitOnEmptyResult()
    findContacts(@SocketIO() io: Server, @ConnectedSocket() socket: ISocket, @MessageBody() data: {keyword?: string, skip?: number, limit?: number}) {
        return this.messageBusiness.findContacts(socket, data.keyword, data.skip, data.limit);
    }

    @OnMessage('message_list')
    @EmitOnFail('message_list_error')
    @EmitOnSuccess('message_list_successfully')
    @SkipEmitOnEmptyResult()
    findMessages(@SocketIO() io: Server, @ConnectedSocket() socket: ISocket, @MessageBody() data: {room: number, skip?: number, limit?: number}) {
        return this.messageBusiness.findMessages(socket, data.room, data.skip, data.limit);
    }

    @OnMessage('message_directly')
    @EmitOnFail('message_directly_error')
    @EmitOnSuccess('message_directly_successfully')
    @SkipEmitOnEmptyResult()
    createMessage(@SocketIO() io: Server, @ConnectedSocket() socket: ISocket, @MessageBody() data: MessageView) {
        return this.messageBusiness.createMessage(socket, data);
    }

    @OnMessage('message_room')
    @EmitOnFail('message_room_error')
    @EmitOnSuccess('message_room_successfully')
    @SkipEmitOnEmptyResult()
    createMessageRoom(@SocketIO() io: Server, @ConnectedSocket() socket: ISocket, @MessageBody() data: MessageView) {
        return this.messageBusiness.createMessageRoom(socket, data);
    }
};
