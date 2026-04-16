'use client';

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

  // System messages are centered
  if (isSystem) {
    return (
      <div className="flex justify-center">
        <span className="text-xs text-muted-foreground px-3 py-1 bg-muted/50 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
        {message.user?.name?.[0] || '?'}
      </div>

      {/* Message Bubble */}
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* User Name & Time */}
        <div className={`flex items-center gap-2 mb-1 text-xs text-muted-foreground ${isOwn ? 'flex-row-reverse' : ''}`}>
          <span className="font-medium">{message.user?.name || '匿名用户'}</span>
          <span>{new Date(message.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        {/* Message Content */}
        <div
          className={`px-3 py-2 rounded-lg max-w-[70%] ${
            isOwn
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      </div>
    </div>
  );
}
