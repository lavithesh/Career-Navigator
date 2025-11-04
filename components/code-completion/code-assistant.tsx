'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles } from 'lucide-react';

interface CodeAssistantProps {
  onInsertCode: (code: string) => void;
  currentCode?: string;
  problemDescription?: string;
}

export function CodeAssistant({ onInsertCode, currentCode = '', problemDescription = '' }: CodeAssistantProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  
  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;
    
    setIsLoading(true);
    setGeneratedCode('');
    
    try {
      // Use a different prompting style to avoid repetition
      const fullPrompt = `// Task: ${prompt}
// Requirements:
// - Write clean, efficient code
// - Include comments
// - Handle edge cases

// Solution in code:`;
      
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
      let code = data.response || '';
      
      // Additional client-side cleanup to prevent duplicated content
      // Stop at first occurrence of a duplicated pattern
      ['// Task:', '/* Write code', '// Solution:'].forEach(pattern => {
        const index = code.indexOf(pattern, 10); // Start searching after the first few characters
        if (index !== -1) {
          code = code.substring(0, index).trim();
        }
      });
      
      setGeneratedCode(code);
    } catch (error) {
      console.error('Error generating code:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleInsert = () => {
    if (generatedCode) {
      onInsertCode(generatedCode);
      setGeneratedCode('');
      setPrompt('');
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-md bg-card">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        Code Assistant
      </h3>
      
      <Textarea
        placeholder="Describe what code you need help with..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="min-h-20"
      />
      
      <div className="flex gap-2">
        <Button 
          onClick={handleGenerate} 
          disabled={isLoading || !prompt.trim()}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>Generate Code</>
          )}
        </Button>
      </div>
      
      {generatedCode && (
        <div className="mt-4 space-y-2">
          <div className="bg-muted p-4 rounded-md overflow-x-auto">
            <pre className="text-sm">{generatedCode}</pre>
          </div>
          
          <Button 
            onClick={handleInsert}
            variant="outline"
          >
            Insert Into Editor
          </Button>
        </div>
      )}
    </div>
  );
} 