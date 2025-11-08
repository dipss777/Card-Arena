import { io, Socket } from 'socket.io-client';
import { 
  SocketEvents, 
  CreateRoomPayload, 
  JoinRoomPayload, 
  PlayCardPayload 
} from '@shared/types';

// Use empty string to connect to same origin (works with Vite proxy)
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

class SocketService {
  private socket: Socket | null = null;

  connect(): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      path: '/socket.io',  // Explicitly set path for Vite proxy
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on(SocketEvents.CONNECT, () => {
      console.log('Connected to server');
    });

    this.socket.on(SocketEvents.DISCONNECT, () => {
      console.log('Disconnected from server');
    });

    this.socket.on(SocketEvents.ERROR, (error: any) => {
      console.error('Socket error:', error);
    });

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  // Room events
  createRoom(payload: CreateRoomPayload): void {
    this.socket?.emit(SocketEvents.CREATE_ROOM, payload);
  }

  joinRoom(payload: JoinRoomPayload): void {
    this.socket?.emit(SocketEvents.JOIN_ROOM, payload);
  }

  leaveRoom(): void {
    this.socket?.emit(SocketEvents.LEAVE_ROOM);
  }

  // Game events
  playCard(payload: PlayCardPayload): void {
    this.socket?.emit(SocketEvents.PLAY_CARD, payload);
  }

  // Chat events
  sendMessage(message: string): void {
    this.socket?.emit(SocketEvents.SEND_MESSAGE, message);
  }

  // Event listeners
  on(event: string, callback: (...args: any[]) => void): void {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    this.socket?.off(event, callback);
  }
}

export const socketService = new SocketService();
