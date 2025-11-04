'use client';

import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  message: string;
  isBot?: boolean;
}

export function ChatMessage({ message, isBot }: ChatMessageProps) {
  return (
    <div className={cn(
      'flex items-start gap-3 p-4 rounded-lg',
      isBot ? 'bg-secondary' : 'bg-muted'
    )}>
      <div className="p-2 rounded-full bg-primary">
        {isBot ? <Bot className="h-4 w-4 text-primary-foreground" /> : <User className="h-4 w-4 text-primary-foreground" />}
      </div>
      <p className="text-sm leading-relaxed">{message}</p>
    </div>
  );
}