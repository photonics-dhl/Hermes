'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

interface MessageInputProps {
  onSend: (content: string) => void;
  onTyping: (isTyping: boolean) => void;
  disabled?: boolean;
}

export function MessageInput({ onSend, onTyping, disabled }: MessageInputProps) {
  const [content, setContent] = useState('');
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  const handleSend = useCallback(() => {
    if (!content.trim() || disabled) return;

    onSend(content.trim());
    setContent('');

    // Clear typing state
    if (isTypingRef.current) {
      isTypingRef.current = false;
      onTyping(false);
    }
  }, [content, disabled, onSend, onTyping]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);

    // Handle typing indicator
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      onTyping(true);
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      onTyping(false);
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTypingRef.current) {
        onTyping(false);
      }
    };
  }, [onTyping]);

  return (
    <div className="border-t p-4">
      <div className="flex gap-2 items-end">
        <textarea
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? '连接中...' : '输入消息，按 Enter 发送...'}
          disabled={disabled}
          maxLength={500}
          rows={1}
          className={cn(
            'flex-1 resize-none rounded-lg border px-3 py-2 text-sm',
            'focus:outline-none focus:ring-2 focus:ring-ring',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'min-h-[40px] max-h-[120px]'
          )}
          style={{
            height: 'auto',
            overflowY: 'auto',
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = Math.min(target.scrollHeight, 120) + 'px';
          }}
        />
        <Button
          type="button"
          size="icon"
          onClick={handleSend}
          disabled={!content.trim() || disabled}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        {content.length}/500
      </p>
    </div>
  );
}
