'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

interface UseTeaPartySocketOptions {
  roomId: string;
  userId?: string;
}

interface OnlineUser {
  id: string;
  name: string | null;
  avatar: string | null;
}

interface TypingUser {
  userId: string;
  userName: string | null;
  roomId: string;
  isTyping: boolean;
}

export function useTeaPartySocket(roomId: string) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  useEffect(() => {
    // Get token from localStorage (set by NextAuth)
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No auth token found for socket connection');
      return;
    }

    // Create socket connection
    const socket = io(`${SOCKET_URL}/tea-party`, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    socket.on('room:error', (error: { code: string; message: string }) => {
      console.error('Room error:', error);
    });

    socket.on('user:typing', (data: TypingUser) => {
      setTypingUsers((prev) => {
        const filtered = prev.filter((u) => u.userId !== data.userId);
        if (data.isTyping) {
          return [...filtered, data];
        }
        return filtered;
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const joinRoom = useCallback(() => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('room:join', { roomId });
    }
  }, [roomId, isConnected]);

  const leaveRoom = useCallback(() => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('room:leave', { roomId });
    }
  }, [roomId, isConnected]);

  const sendMessage = useCallback((content: string, type: string = 'TEXT') => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('message:send', { roomId, content, type });
    }
  }, [roomId, isConnected]);

  const sendTyping = useCallback((isTyping: boolean) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('message:typing', { roomId, isTyping });
    }
  }, [roomId, isConnected]);

  const requestHistory = useCallback((cursor?: string, limit: number = 50) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('message:history', { roomId, cursor, limit });
    }
  }, [roomId, isConnected]);

  return {
    socket: socketRef.current,
    isConnected,
    onlineUsers,
    typingUsers,
    joinRoom,
    leaveRoom,
    sendMessage,
    sendTyping,
    requestHistory,
  };
}
