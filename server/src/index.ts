import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from './middleware/auth.js';
import { registerRoomHandlers } from './handlers/room.js';
import { registerMessageHandlers } from './handlers/message.js';

// Initialize Prisma
export const prisma = new PrismaClient();

// Create HTTP server
const httpServer = createServer();

// Create Socket.io server
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3002', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return next(new Error('Invalid token'));
    }

    socket.data.user = decoded;
    next();
  } catch (error) {
    console.error('Socket auth error:', error);
    next(new Error('Authentication failed'));
  }
});

// Register event handlers
registerRoomHandlers(io, prisma);
registerMessageHandlers(io, prisma);

// Start server
const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});

// Cleanup on shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down...');
  await prisma.$disconnect();
  httpServer.close();
});
