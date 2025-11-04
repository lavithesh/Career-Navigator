'use client';

import Editor from '@monaco-editor/react';
import { SupportedLanguage } from '@/lib/constants/editor-languages';

interface CodeEditorProps {
  code: string;
  language: SupportedLanguage;
  onChange: (value: string | undefined) => void;
}

export function MonacoEditor({ code, language, onChange }: CodeEditorProps) {
  return (
    <div className="h-[600px]">
      <Editor
        height="100%"
        defaultLanguage={language}
        language={language}
        theme="vs-dark"
        value={code}
        onChange={onChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          formatOnPaste: true,
          formatOnType: true,
        }}
      />
    </div>
  );
}