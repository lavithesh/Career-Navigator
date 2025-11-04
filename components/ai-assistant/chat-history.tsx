'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from './chat-message';

interface Message {
  id: string;
  content: string;
  isBot: boolean;
}

interface ChatHistoryProps {
  messages: Message[];
}

export function ChatHistory({ messages }: ChatHistoryProps) {
  return (
    <ScrollArea className="h-[600px] pr-4">
      <div className="space-y-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message.content}
            isBot={message.isBot}
          />
        ))}
      </div>
    </ScrollArea>
  );
}