import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';

export function registerRoomHandlers(io: Server, prisma: PrismaClient) {
  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.data.user.id}`);

    // Join room
    socket.on('room:join', async ({ roomId }: { roomId: string }) => {
      try {
        // Check room exists and user can join
        const room = await prisma.teaPartyRoom.findUnique({
          where: { id: roomId },
          include: {
            _count: { select: { participants: true } },
          },
        });

        if (!room) {
          socket.emit('room:error', { code: 'NOT_FOUND', message: '房间不存在' });
          return;
        }

        if (room._count.participants >= room.maxParticipants) {
          socket.emit('room:error', { code: 'ROOM_FULL', message: '房间已满' });
          return;
        }

        // Add participant if not exists
        await prisma.teaPartyRoomParticipant.upsert({
          where: {
            roomId_userId: { roomId, userId: socket.data.user.id },
          },
          create: { roomId, userId: socket.data.user.id },
          update: {},
        });

        // Join socket room
        await socket.join(roomId);

        // Get room details with participants
        const roomDetail = await getRoomDetail(prisma, roomId);
        const participants = await getRoomParticipants(prisma, roomId);

        // Notify user they joined
        socket.emit('room:joined', {
          room: roomDetail,
          users: participants,
        });

        // Notify others
        socket.to(roomId).emit('room:user_joined', {
          user: {
            id: socket.data.user.id,
            name: socket.data.user.name,
          },
          roomId,
        });

        // Create system message
        const systemMessage = await prisma.message.create({
          data: {
            roomId,
            userId: socket.data.user.id,
            content: `${socket.data.user.name || '用户'} 加入了房间`,
            type: 'SYSTEM',
          },
        });

        // Broadcast system message
        io.to(roomId).emit('message:received', {
          message: {
            ...systemMessage,
            user: {
              id: socket.data.user.id,
              name: socket.data.user.name,
              avatar: null,
            },
          },
        });
      } catch (error) {
        console.error('room:join error:', error);
        socket.emit('room:error', { code: 'SERVER_ERROR', message: '加入房间失败' });
      }
    });

    // Leave room
    socket.on('room:leave', async ({ roomId }: { roomId: string }) => {
      try {
        await socket.leave(roomId);

        // Remove participant
        await prisma.teaPartyRoomParticipant.deleteMany({
          where: { roomId, userId: socket.data.user.id },
        });

        // Notify others
        socket.to(roomId).emit('room:user_left', {
          userId: socket.data.user.id,
          roomId,
        });

        // Create system message
        const systemMessage = await prisma.message.create({
          data: {
            roomId,
            userId: socket.data.user.id,
            content: `${socket.data.user.name || '用户'} 离开了房间`,
            type: 'SYSTEM',
          },
        });

        // Broadcast system message
        io.to(roomId).emit('message:received', {
          message: {
            ...systemMessage,
            user: {
              id: socket.data.user.id,
              name: socket.data.user.name,
              avatar: null,
            },
          },
        });
      } catch (error) {
        console.error('room:leave error:', error);
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.data.user.id}`);
      // Note: We don't auto-leave rooms on disconnect to preserve chat history
    });
  });
}

async function getRoomDetail(prisma: PrismaClient, roomId: string) {
  return prisma.teaPartyRoom.findUnique({
    where: { id: roomId },
    select: {
      id: true,
      name: true,
      description: true,
      isPublic: true,
      maxParticipants: true,
      hostId: true,
      createdAt: true,
    },
  });
}

async function getRoomParticipants(prisma: PrismaClient, roomId: string) {
  const participants = await prisma.teaPartyRoomParticipant.findMany({
    where: { roomId },
    include: {
      user: {
        select: { id: true, name: true, avatar: true },
      },
    },
    take: 50,
  });
  return participants.map((p: { user: { id: string; name: string | null; avatar: string | null } }) => p.user);
}
