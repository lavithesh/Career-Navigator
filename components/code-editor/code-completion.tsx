'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, Code, Sparkles, Check } from 'lucide-react';

interface CodeCompletionProps {
  onInsertCode: (code: string) => void;
  currentCode?: string;
}

export function CodeCompletion({ onInsertCode, currentCode = '' }: CodeCompletionProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  
  // Predefined prompts that work well with StarCoder
  const suggestedPrompts = [
    "Fix bugs in my code",
    "Optimize this solution",
    "Add comments to explain the code",
    "Implement a function to...",
    "Convert this to use async/await"
  ];
  
  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;
    
    setIsLoading(true);
    setGeneratedCode('');
    
    try {
      // Format for StarCoder
      const fullPrompt = `/* 
Current code:
${currentCode}

Request: ${prompt}
*/

// Improved code:`;
      
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: fullPrompt,
          mode: 'code' 
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate code');
      }
      
      const data = await response.json();
      setGeneratedCode(data.response || '');
    } catch (error) {
      console.error('Error generating code:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSuggestedPrompt = (suggestedPrompt: string) => {
    setPrompt(suggestedPrompt);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          StarCoder Assistance
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {suggestedPrompts.map((suggestedPrompt) => (
            <Button 
              key={suggestedPrompt}
              variant="outline" 
              size="sm"
              onClick={() => handleSuggestedPrompt(suggestedPrompt)}
              className="text-xs"
            >
              {suggestedPrompt}
            </Button>
          ))}
        </div>
        
        <Textarea
          placeholder="Describe what you want to do with your code..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-20"
        />
        
        <Button 
          onClick={handleGenerate} 
          disabled={isLoading || !prompt.trim()}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Generating with StarCoder...
            </>
          ) : (
            <>
              <Code className="h-4 w-4 mr-2" />
              Generate Code
            </>
          )}
        </Button>
      </CardContent>
      
      {generatedCode && (
        <CardFooter className="flex flex-col items-start pt-0">
          <div className="bg-muted p-3 rounded-md w-full overflow-x-auto mb-2">
            <pre className="text-sm whitespace-pre-wrap">{generatedCode}</pre>
          </div>
          
          <Button 
            onClick={() => onInsertCode(generatedCode)}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Check className="h-4 w-4" />
            Insert Code
          </Button>
        </CardFooter>
      )}
    </Card>
  );
} 