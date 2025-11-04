'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-lg p-3 ${
          role === 'user'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        }`}
      >
        <ReactMarkdown
          components={{
            code({ className, children }) {
              const match = /language-(\w+)/.exec(className || '');
              
              // Simplified approach without external highlighting library
              return (
                <div className="relative rounded-md overflow-hidden">
                  <div className="absolute top-0 right-0 bg-gray-700 text-xs text-gray-200 px-2 py-1 rounded-bl">
                    {match ? match[1] : 'code'}
                  </div>
                  <pre className="p-4 pt-8 bg-gray-900 text-gray-100 overflow-x-auto">
                    <code className={className}>{children}</code>
                  </pre>
                </div>
              );
            }
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}