'use client';

import { CodeEditor } from '@/components/code-editor/code-editor';

export default function CodeEditorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Code Editor</h1>
      <div className="border rounded-lg h-[700px]">
        <CodeEditor />
      </div>
    </div>
  );
}