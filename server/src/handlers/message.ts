import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';

export function registerMessageHandlers(io: Server, prisma: PrismaClient) {
  io.on('connection', (socket: Socket) => {
    // Send message
    socket.on('message:send', async (data: { roomId: string; content: string; type?: string }) => {
      try {
        const { roomId, content, type = 'TEXT' } = data;

        // Validate content
        if (!content || content.trim().length === 0) {
          socket.emit('room:error', { code: 'INVALID_CONTENT', message: '消息内容不能为空' });
          return;
        }

        if (content.length > 500) {
          socket.emit('room:error', { code: 'CONTENT_TOO_LONG', message: '消息不能超过500字符' });
          return;
        }

        // Verify user is in room (check if socket has joined)
        const rooms = Array.from(socket.rooms);
        if (!rooms.includes(roomId)) {
          socket.emit('room:error', { code: 'NOT_IN_ROOM', message: '请先加入房间' });
          return;
        }

        // Create message
        const message = await prisma.message.create({
          data: {
            roomId,
            userId: socket.data.user.id,
            content: content.trim(),
            type: type as 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM',
          },
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
        });

        // Broadcast to room
        io.to(roomId).emit('message:received', {
          message: {
            ...message,
            user: message.user,
          },
        });
      } catch (error) {
        console.error('message:send error:', error);
        socket.emit('room:error', { code: 'SERVER_ERROR', message: '发送消息失败' });
      }
    });

    // Typing indicator
    socket.on('message:typing', ({ roomId, isTyping }: { roomId: string; isTyping: boolean }) => {
      socket.to(roomId).emit('user:typing', {
        userId: socket.data.user.id,
        userName: socket.data.user.name,
        roomId,
        isTyping,
      });
    });

    // Get message history
    socket.on('message:history', async ({ roomId, cursor, limit = 50 }: { roomId: string; cursor?: string; limit?: number }) => {
      try {
        const messages = await prisma.message.findMany({
          where: { roomId },
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: limit + 1,
          ...(cursor && {
            cursor: { id: cursor },
            skip: 1,
          }),
        });

        const hasMore = messages.length > limit;
        const result = hasMore ? messages.slice(0, limit) : messages;

        // Reverse to get chronological order
        result.reverse();

        socket.emit('message:history', {
          messages: result,
          hasMore,
          nextCursor: hasMore ? result[result.length - 1]?.id : null,
        });
      } catch (error) {
        console.error('message:history error:', error);
        socket.emit('room:error', { code: 'SERVER_ERROR', message: '获取历史消息失败' });
      }
    });
  });
}
