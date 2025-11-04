import { NextResponse } from 'next/server'

// JDoodle language mapping based on their API documentation
const LANGUAGE_MAP: Record<string, { language: string, versionIndex: string }> = {
  python: { language: "python3", versionIndex: "0" },
  javascript: { language: "nodejs", versionIndex: "0" },
  java: { language: "java", versionIndex: "0" },
  c: { language: "c", versionIndex: "0" },
  cpp: { language: "cpp", versionIndex: "0" },
  php: { language: "php", versionIndex: "0" },
  ruby: { language: "ruby", versionIndex: "0" },
  go: { language: "go", versionIndex: "0" },
  csharp: { language: "csharp", versionIndex: "0" },
  typescript: { language: "typescript", versionIndex: "0" }
}

export async function POST(req: Request) {
  try {
    const { code, language } = await req.json()
    console.log('Executing code:', { language, code })

    // Get the correct JDoodle language mapping
    const languageKey = language.toLowerCase()
    const languageConfig = LANGUAGE_MAP[languageKey] || { language: languageKey, versionIndex: "0" }

    const response = await fetch('https://api.jdoodle.com/v1/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId: process.env.JDOODLE_CLIENT_ID,
        clientSecret: process.env.JDOODLE_CLIENT_SECRET,
        script: code,
        language: languageConfig.language,
        versionIndex: languageConfig.versionIndex
      }),
    })

    const data = await response.json()
    console.log('JDoodle response:', data)
    
    if (data.error) {
      console.error('JDoodle error:', data.error)
      return NextResponse.json({ error: data.error }, { status: 400 })
    }

    return NextResponse.json({ 
      output: data.output,
      memory: data.memory,
      cpuTime: data.cpuTime,
      statusCode: data.statusCode
    })
  } catch (error) {
    console.error('Code execution error:', error)
    return NextResponse.json(
      { error: 'Failed to execute code' },
      { status: 500 }
    )
  }
} 