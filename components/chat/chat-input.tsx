'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ value, onChange, onSubmit, disabled = false, placeholder = "Type your message..." }: ChatInputProps) {
  return (
    <form onSubmit={onSubmit} className="p-4 border-t flex space-x-2">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-grow"
        disabled={disabled}
      />
      <Button type="submit" disabled={disabled}>
        <Send className="h-4 w-4 mr-2" />
        Send
      </Button>
    </form>
  );
}