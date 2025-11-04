import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function POST(request: Request) {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const { prompt } = await request.json();
    
    console.log('AI Assistant API received prompt:', prompt);

    const response = await fetch(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Gemini API request failed with status', response.status, error);
      throw new Error(`Gemini API request failed: ${response.status} ${error}`);
    }

    const result = await response.json();
    
    // Extract the generated text from Gemini's response format
    const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text || 
      "I apologize, but I couldn't generate a response.";

    return NextResponse.json({ response: generatedText });

  } catch (error) {
    console.error('Error in AI Assistant API:', error);
    return NextResponse.json({
      response: "I apologize, but I'm having trouble connecting to my knowledge base right now. Please try again later."
    });
  }
}

// Helper function to get fallback responses
function getFallbackResponse(language: string) {
  if (language === 'python') {
    const pythonFallback = `Here's a simple Python solution:\n\n` +
      "```python\n" + 
      'def main():\n    name = input("Enter your name: ")\n    print(f"Hello, {name}!")\n\nif __name__ == "__main__":\n    main()\n' + 
      "```\n\n" +
      "Let me know if you need any modifications! 🚀";
    
    return NextResponse.json({ response: pythonFallback });
  } else {
    const jsFallback = `Here's a simple JavaScript solution:\n\n` +
      "```javascript\n" + 
      'function greet() {\n    const name = prompt("Enter your name:");\n    console.log(`Hello, ${name}!`);\n}\n\ngreet();\n' + 
      "```\n\n" +
      "Let me know if you need any modifications! 🚀";
    
    return NextResponse.json({ response: jsFallback });
  }
}

function detectLanguage(prompt: string, code: string): string {
  // Default to JavaScript if we can't determine
  let language = 'javascript';
  
  // Check prompt for language mentions
  const promptLower = prompt.toLowerCase();
  if (promptLower.includes('python')) {
    language = 'python';
  } else if (promptLower.includes('javascript') || promptLower.includes(' js ')) {
    language = 'javascript';
  } else if (promptLower.includes('typescript') || promptLower.includes(' ts ')) {
    language = 'typescript';
  } else if (promptLower.includes('java ')) {
    language = 'java';
  } else if (promptLower.includes('c++') || promptLower.includes('cpp')) {
    language = 'cpp';
  } else if (promptLower.includes('c#') || promptLower.includes('csharp')) {
    language = 'csharp';
  }
  
  // If language not found in prompt, try to detect from code
  if (language === 'javascript') {
    if (code.includes('print(') && !code.includes(';')) {
      language = 'python';
    } else if (code.includes('System.out.println') || code.includes('public class')) {
      language = 'java';
    } else if (code.includes('#include')) {
      language = 'cpp';
    }
  }
  
  return language;
}

// Helper function to format code responses
function formatCodeResponse(prompt: string, rawResponse: string): string {
  // Remove any repetitive patterns
  let cleanedResponse = removeDuplicatedCode(rawResponse);
  
  // Check if the response already has the desired format
  const hasIntro = /^[A-Za-z].*\./.test(cleanedResponse.split('\n')[0]);
  const hasCode = /```|\n    |\n\t/.test(cleanedResponse);
  const hasClosing = /would you like|feel free|let me know|you can adjust|you can modify/.test(cleanedResponse.toLowerCase());
  
  // If it already has the desired format, return it
  if (hasIntro && hasCode && hasClosing) {
    return cleanedResponse;
  }
  
  // Extract any code blocks
  let codeBlock = '';
  
  // Check for markdown code blocks
  const codeBlockMatch = cleanedResponse.match(/```(?:\w+)?\s*([\s\S]+?)```/);
  if (codeBlockMatch) {
    codeBlock = codeBlockMatch[1].trim();
  } 
  // Check for indented code blocks
  else if (cleanedResponse.includes('\n    ') || cleanedResponse.includes('\n\t')) {
    const lines = cleanedResponse.split('\n');
    const codeLines = lines.filter(line => line.startsWith('    ') || line.startsWith('\t'));
    if (codeLines.length > 0) {
      codeBlock = codeLines.join('\n');
    }
  } 
  // Assume the whole response is code if it looks like code
  else if (cleanedResponse.includes('{') && cleanedResponse.includes('}')) {
    codeBlock = cleanedResponse;
  }
  
  // Determine the language from the prompt or code
  let language = 'javascript'; // Default
  
  if (prompt.toLowerCase().includes('python')) {
    language = 'python';
  } else if (prompt.toLowerCase().includes('java ')) {
    language = 'java';
  } else if (prompt.toLowerCase().includes('c++')) {
    language = 'cpp';
  } else if (prompt.toLowerCase().includes('typescript')) {
    language = 'typescript';
  } else if (cleanedResponse.includes('def ') && (cleanedResponse.includes(':') || cleanedResponse.includes('print('))) {
    language = 'python';
  } else if (cleanedResponse.includes('public class ') || cleanedResponse.includes('public static void main')) {
    language = 'java';
  } else if (cleanedResponse.includes('#include') || cleanedResponse.includes('int main()')) {
    language = 'cpp';
  } else if (cleanedResponse.includes('interface ') || cleanedResponse.includes(': ') || cleanedResponse.includes('<T>')) {
    language = 'typescript';
  }
  
  // Create the formatted response
  let formattedResponse = '';
  
  // Add an intro if there isn't one
  if (!hasIntro) {
    formattedResponse += `Here's a solution for your task:\n\n`;
  } else {
    // Use the first line as intro if it exists
    const firstLine = cleanedResponse.split('\n')[0];
    formattedResponse += firstLine + '\n\n';
  }
  
  // Add the code block with proper syntax highlighting
  formattedResponse += '```' + language + '\n' + codeBlock.trim() + '\n```\n\n';
  
  // Add a closing invitation if there isn't one
  if (!hasClosing) {
    formattedResponse += `Feel free to modify this code to better suit your needs. Let me know if you need any clarification or have questions!`;
  } else {
    // Find and use the existing closing line if possible
    const lines = cleanedResponse.split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
      if (/would you like|feel free|let me know|you can adjust|you can modify/.test(lines[i].toLowerCase())) {
        formattedResponse += lines[i];
        break;
      }
      
      // If we get to the beginning without finding a closing line, use default
      if (i === 0) {
        formattedResponse += `Feel free to modify this code to better suit your needs. Let me know if you need any clarification or have questions!`;
      }
    }
  }
  
  return formattedResponse;
}

// Helper function to remove duplicated code blocks
function removeDuplicatedCode(text: string): string {
  // If the text contains duplicate blocks like "/* Write code" or "// Solution:"
  const solutions = text.split(/\/\* Write code|\/\/ Solution:|\/\/ Task:|\/\/ Format/);
  if (solutions.length > 1) {
    // Return only the first solution block, cleaned up
    return solutions[0].trim();
  }
  
  // If there's repetition of the same code snippet
  const lines = text.split('\n');
  const uniqueLines: string[] = [];
  let previousBlock = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // If we see code pattern indicators again, it's likely the start of a duplicate
    if ((line.includes('#include') || line.includes('function ') || line.includes('def ') || 
         line.includes('class ') || line.includes('import ')) && 
        previousBlock.includes(line)) {
      break;
    }
    
    uniqueLines.push(line);
    previousBlock += line + '\n';
  }
  
  return uniqueLines.join('\n');
} 