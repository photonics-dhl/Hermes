'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MoreVertical, Settings, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatRoom } from '@/components/features/tea-party/ChatRoom';
import { OnlineUsers } from '@/components/features/tea-party/OnlineUsers';
import { MessageList } from '@/components/features/tea-party/MessageList';
import { MessageInput } from '@/components/features/tea-party/MessageInput';
import { useTeaPartySocket } from '@/hooks/useTeaPartySocket';
import { useTeaPartyMessages } from '@/hooks/useTeaPartyMessages';

interface Message {
  id: string;
  content: string;
  type: string;
  roomId: string;
  userId: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
}

interface Room {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  maxParticipants: number;
  hostId: string;
  host: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
  participants: Array<{
    user: {
      id: string;
      name: string | null;
      avatar: string | null;
    };
    joinedAt: string;
  }>;
  recentMessages: Message[];
  participantCount: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export default function TeaPartyRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUsers, setShowUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { socket, isConnected, onlineUsers, typingUsers, joinRoom: joinSocketRoom, leaveRoom: leaveSocketRoom, sendMessage, sendTyping } = useTeaPartySocket(roomId);
  const { messages, addMessage, setMessages } = useTeaPartyMessages();

  // Fetch room details
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await fetch(`/api/v1/tea-party/rooms/${roomId}`);
        const data: ApiResponse<Room> = await res.json();

        if (data.success && data.data) {
          setRoom(data.data);
          setMessages(data.data.recentMessages as any);
        } else {
          setError(data.error?.message || '房间不存在');
        }
      } catch (err) {
        setError('加载房间失败');
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomId, setMessages]);

  // Join room via socket when connected
  useEffect(() => {
    if (socket && isConnected && room) {
      joinSocketRoom();
    }

    return () => {
      if (socket && isConnected) {
        leaveSocketRoom();
      }
    };
  }, [socket, isConnected, room?.id]);

  // Listen for socket events
  useEffect(() => {
    if (!socket) return;

    socket.on('room:joined', ({ room: updatedRoom, users }: { room: Room; users: any[] }) => {
      setRoom(updatedRoom);
    });

    socket.on('room:user_joined', ({ user }: { user: { id: string; name: string | null; avatar: string | null } }) => {
      setRoom((prev) =>
        prev
          ? {
              ...prev,
              participants: [
                ...prev.participants,
                { user, joinedAt: new Date().toISOString() },
              ],
              participantCount: prev.participantCount + 1,
            }
          : prev
      );
    });

    socket.on('room:user_left', ({ userId }: { userId: string }) => {
      setRoom((prev) =>
        prev
          ? {
              ...prev,
              participants: prev.participants.filter((p) => p.user.id !== userId),
              participantCount: Math.max(0, prev.participantCount - 1),
            }
          : prev
      );
    });

    socket.on('message:received', ({ message }: { message: any }) => {
      addMessage(message);
    });

    return () => {
      socket.off('room:joined');
      socket.off('room:user_joined');
      socket.off('room:user_left');
      socket.off('message:received');
    };
  }, [socket, addMessage]);

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;
    sendMessage(content);
  };

  const handleTyping = (isTyping: boolean) => {
    sendTyping(isTyping);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <h2 className="text-xl font-semibold mb-2">{error || '房间不存在'}</h2>
        <Button variant="outline" onClick={() => router.push('/tea-party')}>
          返回房间列表
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-120px)]">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/tea-party')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold">{room.name}</h1>
              {room.description && (
                <p className="text-sm text-muted-foreground">{room.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUsers(!showUsers)}
            >
              <Users className="w-4 h-4 mr-2" />
              {room.participantCount}
            </Button>
          </div>
        </div>

        {/* Messages */}
        <MessageList
          messages={messages}
          typingUsers={typingUsers}
          roomId={roomId}
        />

        {/* Input */}
        <MessageInput
          onSend={handleSendMessage}
          onTyping={handleTyping}
          disabled={!isConnected}
        />
      </div>

      {/* Online Users Sidebar */}
      {showUsers && (
        <OnlineUsers
          users={room.participants.map((p) => p.user)}
          onClose={() => setShowUsers(false)}
        />
      )}
    </div>
  );
}
