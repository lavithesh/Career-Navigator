'use client'

import { useState, useEffect } from 'react'
import { Editor } from '@monaco-editor/react'
import { EditorToolbar, SupportedLanguage } from './editor-toolbar'
import { useToast } from '@/components/ui/use-toast'
import { useSession } from 'next-auth/react'

interface OutputData {
  output: string;
  memory?: string;
  cpuTime?: string;
  statusCode?: number;
}

interface CodeEditorProps {
  onSuccess?: (code: string) => void;
  onChange?: (code: string) => void;
  value?: string;
  defaultCode?: string;
  initialLanguage?: SupportedLanguage;
}

export function CodeEditor({ 
  onSuccess, 
  onChange,
  value,
  defaultCode = '', 
  initialLanguage = 'javascript' as SupportedLanguage,
  ...props
}: CodeEditorProps) {
  const [code, setCode] = useState(value || defaultCode)
  const [language, setLanguage] = useState<SupportedLanguage>(initialLanguage)
  const [output, setOutput] = useState<OutputData | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const { toast } = useToast()
  const { data: session } = useSession()

  // Set default code template on load
  useEffect(() => {
    // Default code templates
    const defaultCode = "# Write your code here\nprint('Hello, World!')"
    setCode(defaultCode)
  }, [])

  // Add an effect to update the internal state when the value prop changes
  useEffect(() => {
    if (value !== undefined) {
      setCode(value)
    }
  }, [value])

  // Add an effect to update language when initialLanguage prop changes
  useEffect(() => {
    setLanguage(initialLanguage)
  }, [initialLanguage])

  const handleRun = async () => {
    if (!code.trim()) {
      setOutput({ output: 'Please enter some code first!' })
      return
    }

    try {
      setIsRunning(true)
      console.log('Sending code to execute:', { code, language })
      
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language: language.toLowerCase(),
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Execution response:', data)

      if (data.error) {
        setOutput({ output: `Error: ${data.error}` })
        return
      }

      setOutput(data)
      
      if (data.statusCode === 200 && onSuccess) {
        onSuccess(code)
      }
    } catch (error) {
      console.error('Error executing code:', error)
      setOutput({ 
        output: 'Error executing code. Please try again.',
        statusCode: 500
      })
    } finally {
      setIsRunning(false)
    }
  }

  const handleSave = () => {
    if (!session?.user) {
      toast({
        title: "Login Required",
        description: "Please sign in to save your code",
        variant: "destructive"
      })
      return
    }
    // Implement save functionality
    console.log('Saving code...')
  }

  const handleLoad = () => {
    if (!session?.user) {
      toast({
        title: "Login Required",
        description: "Please sign in to load your code",
        variant: "destructive"
      })
      return
    }
    // Implement load functionality
    console.log('Loading code...')
  }

  // Update the handleCodeChange function to call the onChange prop
  const handleCodeChange = (newCode: string) => {
    setCode(newCode)
    if (onChange) {
      onChange(newCode)
    }
  }

  return (
    <div className="grid grid-rows-[auto,1fr,0.3fr] h-full gap-0">  
      <EditorToolbar
        language={language}
        onLanguageChange={setLanguage}
        onRun={handleRun}
        onSave={handleSave}
        onLoad={handleLoad}
        isRunning={isRunning}
      />
      <div className="border-b">
        <Editor
          height="100%"
          defaultLanguage={language.toLowerCase()}
          language={language.toLowerCase()}
          value={code}
          onChange={handleCodeChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 16,
            lineNumbers: 'on',
            automaticLayout: true,
          }}
        />
      </div>
      <div className="bg-black text-white p-4 overflow-auto">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold">Output</h3>
          {output?.statusCode && (
            <span className={`text-xs px-2 py-1 rounded ${
              output.statusCode === 200 ? 'bg-green-600' : 'bg-red-600'
            }`}>
              Status: {output.statusCode}
            </span>
          )}
        </div>
        {isRunning ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : (
          <pre className="font-mono text-sm whitespace-pre-wrap">
            {output?.output || 'Run your code to see the output here'}
            {output?.memory && `\n\nMemory used: ${output.memory}`}
            {output?.cpuTime && `\nCPU time: ${output.cpuTime}s`}
          </pre>
        )}
      </div>
    </div>
  )
} 