import express, { Express, Request, Response } from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { config } from './config/config';
import { RoomManager } from './services/RoomManager';
import { SocketHandler } from './socket/SocketHandler';

class Server {
  private app: Express;
  private server: any;
  private io: SocketIOServer;
  private roomManager: RoomManager;
  private socketHandler: SocketHandler;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    
    // Dynamic CORS for ngrok support
    const corsOrigins = config.corsOrigin.split(',').map(o => o.trim());
    
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: (origin, callback) => {
          // Allow requests with no origin (like mobile apps, Postman, etc.)
          if (!origin) return callback(null, true);
          
          // Check if origin is in allowed list or is ngrok domain
          if (corsOrigins.includes(origin) || 
              origin.includes('.ngrok-free.dev') || 
              origin.includes('.ngrok.io') ||
              origin.includes('.ngrok.app')) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        },
        methods: ['GET', 'POST'],
        credentials: true
      }
    });
    
    this.roomManager = new RoomManager();
    this.socketHandler = new SocketHandler(this.io, this.roomManager);
    
    this.configureMiddleware();
    this.configureRoutes();
    this.initializeSocketHandlers();
  }

  /**
   * Configure Express middleware
   */
  private configureMiddleware(): void {
    const corsOrigins = config.corsOrigin.split(',').map(o => o.trim());
    
    this.app.use(cors({
      origin: (origin, callback) => {
        // Allow requests with no origin
        if (!origin) return callback(null, true);
        
        // Check if origin is allowed or is ngrok domain
        if (corsOrigins.includes(origin) || 
            origin.includes('.ngrok-free.dev') || 
            origin.includes('.ngrok.io') ||
            origin.includes('.ngrok.app')) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true
    }));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  /**
   * Configure REST API routes
   */
  private configureRoutes(): void {
    // Health check
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        rooms: this.roomManager.getRoomCount()
      });
    });

    // Get all rooms (for debugging/admin)
    this.app.get('/api/rooms', (req: Request, res: Response) => {
      const rooms = this.roomManager.getAllRooms().map(room => ({
        id: room.id,
        code: room.code,
        isPublic: room.isPublic,
        playerCount: room.players.length,
        maxPlayers: room.maxPlayers,
        status: room.status,
        createdAt: room.createdAt
      }));
      res.json({ rooms });
    });

    // Get room by code
    this.app.get('/api/rooms/:code', (req: Request, res: Response) => {
      const room = this.roomManager.getRoomByCode(req.params.code);
      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }
      res.json({ 
        room: {
          id: room.id,
          code: room.code,
          isPublic: room.isPublic,
          playerCount: room.players.length,
          maxPlayers: room.maxPlayers,
          status: room.status
        }
      });
    });

    // 404 handler
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({ error: 'Not found' });
    });
  }

  /**
   * Initialize Socket.IO handlers
   */
  private initializeSocketHandlers(): void {
    this.socketHandler.initialize();
  }

  /**
   * Start the server
   */
  public start(): void {
    this.server.listen(config.port, () => {
      console.log(`🃏 Card Game Server running on port ${config.port}`);
      console.log(`📡 WebSocket server ready`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
      console.log(`🔗 CORS enabled for: ${config.corsOrigin}`);
    });
  }
}

// Create and start server
const server = new Server();
server.start();

export default Server;
