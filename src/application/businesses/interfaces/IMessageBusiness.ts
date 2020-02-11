import ISocket from '../../models/socket/ISocket';
import ContactView from '../../models/socket/ContactView';
import MessageView from '../../models/socket/MessageView';

interface IMessageBusiness {
    connect(socket: ISocket): Promise<ISocket>;

    disconnect(socket: ISocket): void;

    findContacts(socket: ISocket, keyword?: string, skip?: number, limit?: number): Promise<ContactView[]>;

    findMessages(socket: ISocket, room: number, skip?: number, limit?: number): Promise<MessageView[]>;

    createMessage(socket: ISocket, data: MessageView): Promise<MessageView>;

    createMessageRoom(socket: ISocket, data: MessageView): Promise<MessageView>;
}

export default IMessageBusiness;
