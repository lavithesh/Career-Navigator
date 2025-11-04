import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { question, problemTitle, problemDescription, language } = await request.json();
    
    // Validate input
    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }
    
    // Get the API key from environment variables
    const API_KEY = process.env.HUGGINGFACE_API_KEY;
    
    if (!API_KEY) {
      console.error("HUGGINGFACE_API_KEY is not defined in environment variables");
      return NextResponse.json({ 
        answer: "I can't help right now due to a configuration issue. Please try again later."
      });
    }
    
    // Format the context and prompt for Mistral
    const context = `
Problem Title: ${problemTitle || 'Unknown'}
Problem Description: ${problemDescription || 'Not provided'}
Programming Language: ${language || 'Not specified'}
    `.trim();
    
    const prompt = `<s>[INST] I'm working on a coding problem and need help.

${context}

Question: ${question}

Please provide a helpful, concise response. [/INST]`;
    
    // Call the Mistral API
    const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          return_full_text: false
        }
      })
    });
    
    if (!response.ok) {
      console.error(`API request failed with status ${response.status}`);
      return NextResponse.json({ 
        answer: `I'm having trouble generating a response right now (Error: ${response.status}). Please try again later.`
      });
    }
    
    const data = await response.json();
    console.log("API response:", data);
    
    let answer = "I couldn't process your question. Please try again.";
    
    if (Array.isArray(data) && data[0]?.generated_text) {
      answer = data[0].generated_text;
    } else if (data?.generated_text) {
      answer = data.generated_text;
    }
    
    // If we can't get a proper response, provide a fallback
    if (!answer || answer.length < 10) {
      answer = `I'm sorry, I couldn't generate a proper response to your question about ${problemTitle}. Could you try rephrasing your question?`;
    }
    
    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Error processing problem help request:", error);
    return NextResponse.json({ 
      answer: "I encountered an error while processing your request. Please try again." 
    });
  }
} 