'use client';

import { useRef, useEffect } from 'react';
import { MessageItem } from './MessageItem';
import { TypingIndicator } from './TypingIndicator';

interface Message {
  id: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  roomId: string;
  userId: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
}

interface TypingUser {
  userId: string;
  userName: string | null;
  roomId: string;
  isTyping: boolean;
}

interface MessageListProps {
  messages: Message[];
  typingUsers: TypingUser[];
  roomId: string;
}

export function MessageList({ messages, typingUsers, roomId }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isAtBottomRef.current && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      isAtBottomRef.current = scrollHeight - scrollTop - clientHeight < 100;
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-4 py-4 gap-4"
    >
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}

      {typingUsers.length > 0 && (
        <TypingIndicator users={typingUsers} />
      )}
    </div>
  );
}
