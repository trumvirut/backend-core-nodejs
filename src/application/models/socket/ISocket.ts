import { Socket } from 'socket.io';
import ContactView from './ContactView';

interface ISocket extends Socket {
    user?: ContactView;
}

export default ISocket;
