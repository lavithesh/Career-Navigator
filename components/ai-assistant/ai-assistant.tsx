"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AIAssistantProps {
  context?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AIAssistant({ context = "" }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "I'm your AI assistant. Ask me questions about this problem!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom only if near bottom already
  const scrollToBottom = () => {
    if (messagesEndRef.current && chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 300;
      
      if (isNearBottom) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: "smooth",
          block: "end",
          inline: "nearest"
        });
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    
    // Add user message to chat
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage },
    ]);
    
    setIsLoading(true);

    try {
      // Add console logging to debug the request
      console.log("Sending request to AI assistant API with prompt:", userMessage);
      console.log("Context:", context);
      
      // Include context in the API call if available
      const fullPrompt = context 
        ? `Context: ${context}\n\nQuestion: ${userMessage}`
        : userMessage;
        
      const response = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          prompt: fullPrompt
        }),
      });

      if (!response.ok) {
        console.error("AI assistant API returned error status:", response.status);
        throw new Error(`Failed to get response from AI: ${response.status}`);
      }

      const data = await response.json();
      console.log("AI assistant API response:", data);
      
      // Add AI response to chat
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response || "Sorry, no response was received." },
      ]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-[400px] flex flex-col">
      <CardHeader className="flex-shrink-0 pb-2">
        <CardTitle className="text-lg font-medium">AI Assistant</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col overflow-hidden pt-0">
        <div 
          ref={chatContainerRef}
          className="flex-grow overflow-y-auto mb-4 p-2 border rounded-lg"
        >
          {messages.map((message, index) => (
            <div 
              key={index}
              className={`mb-2 p-2 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground ml-8' 
                  : 'bg-muted text-muted-foreground mr-8'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2 mt-auto">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" size="sm" disabled={isLoading}>
            {isLoading ? "..." : "Send"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 