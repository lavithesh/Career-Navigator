'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

// Define language type
export type SupportedLanguage = "javascript" | "typescript" | "python" | "java" | "cpp";

// Update the props interface to match what you're passing
export interface EditorToolbarProps {
  language: SupportedLanguage;
  onLanguageChange: (newLanguage: SupportedLanguage) => void; // Changed from setLanguage
  onRun: () => Promise<void>;
  onSave: () => void;
  onLoad: () => void;
  isRunning: boolean;
}

export function EditorToolbar({
  language,
  onLanguageChange, // Changed from setLanguage
  onRun,
  onSave,
  onLoad,
  isRunning
}: EditorToolbarProps) {
  return (
    <div className="border-b p-2 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Select
          value={language}
          onValueChange={(value: SupportedLanguage) => onLanguageChange(value)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="typescript">TypeScript</SelectItem>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="java">Java</SelectItem>
            <SelectItem value="cpp">C++</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={onLoad}>
          Load
        </Button>
        <Button variant="outline" size="sm" onClick={onSave}>
          Save
        </Button>
        <Button 
          variant="default" 
          size="sm" 
          onClick={onRun}
          disabled={isRunning}
        >
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running
            </>
          ) : (
            'Run'
          )}
        </Button>
      </div>
    </div>
  );
}