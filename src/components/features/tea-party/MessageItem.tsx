'use client';

import { cn } from '@/lib/utils/cn';

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

interface MessageItemProps {
  message: Message;
  isOwn?: boolean;
}

export function MessageItem({ message, isOwn }: MessageItemProps) {
  const isSystem = message.type === 'SYSTEM';

  if (isSystem) {
    return (
      <div className="flex justify-center animate-fade-in-up">
        <span className="text-xs text-muted-foreground px-3 py-1 bg-tea-bg rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 animate-fade-in-up ${isOwn ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 size-8 rounded-full flex items-center justify-center text-sm font-medium shadow-sm',
          isOwn ? 'bg-tea-primary text-tea-primary-foreground' : 'bg-journal-primary text-journal-primary-foreground'
        )}
      >
        {message.user?.name?.[0] || '?'}
      </div>

      {/* Message Bubble */}
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* User Name & Time */}
        <div className={cn('flex items-center gap-2 mb-1 text-xs text-muted-foreground', isOwn ? 'flex-row-reverse' : '')}>
          <span className="font-medium font-sans">{message.user?.name || '匿名用户'}</span>
          <span className="font-sans">{new Date(message.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        {/* Message Content */}
        <div
          className={cn(
            'px-4 py-3 rounded-2xl max-w-[75%] shadow-sm transition-all duration-200',
            isOwn
              ? 'bg-tea-primary text-tea-primary-foreground rounded-br-md'
              : 'bg-paper-white text-foreground border border-journal-border rounded-bl-md'
          )}
        >
          <p className="text-sm whitespace-pre-wrap break-words font-source-serif leading-relaxed">{message.content}</p>
        </div>
      </div>
    </div>
  );
}
