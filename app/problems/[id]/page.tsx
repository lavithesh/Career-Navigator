'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CodeEditor } from '@/components/code-editor/code-editor';
import { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '@/components/chat/chat-message';
import { ChatInput } from '@/components/chat/chat-input';
import { useSession } from 'next-auth/react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { toast } from '@/components/ui/use-toast'; // Assuming you have toast component
import { AIAssistant } from "@/components/ai-assistant/ai-assistant";

// Define the Message interface at the top of your file
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Define your data structure interfaces
interface Example {
  input: string;
  output: string;
  explanation?: string;
}

interface Problem {
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  constraints: string[];
  examples: Example[];
  hints?: string[];
  // Add other properties as needed
}

const supportedLanguages = ["javascript", "typescript", "python", "java", "cpp"] as const;
type SupportedLanguage = typeof supportedLanguages[number];

// Mapping from course ID to language
const courseToLanguageMap: Record<string, SupportedLanguage> = {
  'dsa': 'javascript',
  'amazon': 'javascript',
  'airbnb': 'javascript',
  'tcs': 'javascript'
};

export default function ProblemPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  
  const problemId = params.id as string;
  const courseId = searchParams.get('course') || 'javascript';
  
  // State for problem details and completion status
  const [problem, setProblem] = useState<Problem | null>(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // State to manage chat messages
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: 'Need help getting started with this problem?' 
    },
    { 
      role: 'assistant', 
      content: 'This problem is asking you to solve a coding challenge. Let me know if you need hints!' 
    }
  ]);
  
  const [input, setInput] = useState('');
  
  // Reference to the chat container for scrolling
  const chatContainerRef = useRef<HTMLDivElement>(null);
  // Track whether we should auto-scroll
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  
  // State for language
  const [language, setLanguage] = useState<"javascript" | "typescript" | "python" | "java" | "cpp">("javascript");
  
  // Convert courseId to language
  const courseLanguage = courseToLanguageMap[courseId] || 'javascript';
  
  // State to store the current code
  const [code, setCode] = useState<string>('');
  
  // Function to mark problem as completed
  const markAsCompleted = async (solution?: string) => {
    if (!session?.user) return;
    
    try {
      const response = await fetch(`/api/progress/${courseId}/problem/${problemId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ solution }),
      });
      
      if (response.ok) {
        setCompleted(true);
        toast({
          title: "Problem Completed!",
          description: "Your progress has been saved",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Failed to mark problem as completed:', error);
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive",
      });
    }
  };
  
  // Fetch problem completion status
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const fetchProblemStatus = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/progress/${courseId}`);
          
          if (response.ok) {
            const data = await response.json();
            setCompleted(!!data.problemCompletions[problemId]);
          }
        } catch (error) {
          console.error('Failed to fetch problem status:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchProblemStatus();
    } else if (status !== 'loading') {
      setLoading(false);
    }
  }, [problemId, courseId, status, session]);
  
  // Fetch problem details
  useEffect(() => {
    const fetchProblemDetails = async () => {
      try {
        setProblem(null);
        setLoading(true);
        
        console.log(`Fetching problem: ${courseId}/${problemId}`);
        const response = await fetch(`/api/problems/${courseId}/${problemId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch problem: ' + await response.text());
        }
        
        const problemData = await response.json();
        console.log('Problem data:', problemData);
        setProblem(problemData);
        
      } catch (error) {
        console.error('Failed to fetch problem details:', error);
        // Don't set fallback data, let the error be handled properly
        toast({
          title: "Error",
          description: "Failed to load problem details. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProblemDetails();
  }, [problemId, courseId]);
  
  // Handle scroll events in the chat container
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    // If user is near bottom (within 50px), we should auto-scroll on new messages
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
    setShouldAutoScroll(isNearBottom);
  };
  
  // Scroll to bottom function - only scrolls the chat container
  const scrollToBottom = () => {
    if (!chatContainerRef.current || !shouldAutoScroll) return;
    
    // Use scrollTo for smooth scrolling within the container only
    chatContainerRef.current.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth'
    });
  };
  
  // Auto-scroll when messages change, but only if the user is already at the bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle submission of new messages
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    
    // Enable auto-scroll when user sends a message
    setShouldAutoScroll(true);

    try {
      // Create context about the current problem
      const context = `
Problem: ${problem?.title || `Problem ${problemId}`}
Difficulty: ${problem?.difficulty || 'Unknown'}
Description: ${problem?.description || 'No description available'}
Language: ${language}
User question: ${input}
      `.trim();

      // Call the Mistral API via our backend
      const response = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          prompt: context
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from AI");
      }

      const data = await response.json();
      
      // Add the AI response to the messages
      const aiResponse: Message = {
        role: 'assistant',
        content: data.response || "I'm sorry, I couldn't generate a helpful response. Could you try rephrasing your question?"
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      // Add a fallback message if the API call fails
      const fallbackResponse: Message = {
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again later."
      };
      
      setMessages(prev => [...prev, fallbackResponse]);
    }
  };

  // Pass the markAsCompleted function to CodeEditor
  const handleCodeSuccess = (code: string) => {
    markAsCompleted(code);
  };

  // Handle inserting generated code
  const handleInsertCode = (generatedCode: string) => {
    const newCode = code ? `${code}\n${generatedCode}` : generatedCode;
    setCode(newCode);
  };

  const getNextProblemId = () => {
    const currentId = parseInt(problemId);
    return (currentId + 1).toString();
  };

  return (
    <div className="container mx-auto py-8">
      {/* Header area with fixed height */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
          <div className="flex items-center space-x-3">
            <Link href={`/problems?course=${courseId}`}>
              <Button variant="outline" size="sm">Back to Problems</Button>
            </Link>
            <h1 className="text-xl font-bold">{problem?.title || `Problem ${problemId}`}</h1>
            {completed && (
              <div className="flex items-center text-green-500 ml-2">
                <CheckCircle className="h-5 w-5 mr-1" />
                <span className="text-sm font-medium">Completed</span>
              </div>
            )}
          </div>
          
          {/* Add Next Problem button */}
          <Link href={`/problems/${getNextProblemId()}?course=${courseId}`}>
            <Button 
              variant="default"
              size="sm"
              className="flex items-center gap-2"
            >
              Next Problem
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Main content area - takes up remaining height */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
          {/* Problem description - 25% width */}
          <div className="lg:col-span-1 bg-card rounded-lg shadow flex flex-col h-[80vh] max-h-[80vh]">
            <div className="p-3 border-b flex-shrink-0">
              <h2 className="font-semibold">Problem Description</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading || !problem ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : problem ? (
                <div className="p-4 prose prose-sm dark:prose-invert">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold m-0">{problem.title}</h2>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : 
                      problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {problem.difficulty}
                    </span>
                  </div>
                  
                  <p className="whitespace-pre-wrap">{problem.description}</p>
                  
                  {problem.constraints && problem.constraints.length > 0 && (
                    <>
                      <h3 className="text-lg font-medium mt-4">Constraints:</h3>
                      <ul className="mt-2">
                        {problem.constraints.map((constraint, index) => (
                          <li key={index}>{constraint}</li>
                        ))}
                      </ul>
                    </>
                  )}
                  
                  {problem.examples && problem.examples.map((example, index) => (
                    <div key={index} className="mt-4">
                      <h3 className="text-lg font-medium">Example {index + 1}:</h3>
                      <pre className="bg-muted p-4 rounded text-sm mt-2 whitespace-pre-wrap overflow-x-auto max-w-full">
                        {Object.entries(example).map(([key, value]) => 
                          (key !== "explanation" && key !== "_id") ? (
                            <div key={key} className="mb-1">
                              <span className="font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}: </span>
                              {value}
                            </div>
                          ) : null
                        )}
                        {example.explanation && (
                          <div className="mt-2">
                            <span className="font-medium">Explanation: </span>
                            <span className="whitespace-pre-line">{example.explanation}</span>
                          </div>
                        )}
                      </pre>
                    </div>
                  ))}
                  
                  {problem.hints && problem.hints.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300">Hints:</h4>
                      <ul className="list-disc ml-5 text-sm text-blue-600 dark:text-blue-300">
                        {problem.hints.map((hint, index) => (
                          <li key={index}>{hint}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 text-center text-red-500">
                  Failed to load problem. Please try refreshing the page.
                </div>
              )}
            </div>
          </div>
          
          {/* Code editor - 50% width */}
          <div className="lg:col-span-2 bg-card rounded-lg shadow h-[80vh] max-h-[80vh] flex flex-col">
            <CodeEditor 
              onSuccess={handleCodeSuccess} 
              onChange={setCode}
              value={code}
              initialLanguage="javascript"
            />
          </div>
          
          {/* AI assistant - 25% width */}
          <div className="lg:col-span-1 bg-card rounded-lg shadow flex flex-col h-[80vh] max-h-[80vh]">
            <div className="p-3 border-b flex-shrink-0">
              <h2 className="font-semibold">AI Assistant</h2>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Chat messages container with scroll handling */}
              <div 
                ref={chatContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 space-y-4"
              >
                {messages.map((message, index) => (
                  <ChatMessage key={index} {...message} />
                ))}
              </div>
              {/* Input area with flex-shrink-0 to prevent it from being compressed */}
              <div className="flex-shrink-0 border-t">
                <ChatInput
                  value={input}
                  onChange={setInput}
                  onSubmit={handleSubmit}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div>
          {/* Problem description section */}
          {/* ... */}
        </div>
        
        
      </div>
    </div>
  );
} 