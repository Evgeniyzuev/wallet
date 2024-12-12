import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  image?: {
    mimeType: string;
    data: string;
  };
}

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: Message[] } = await req.json();
    const lastMessage = messages[messages.length - 1];

    const model = lastMessage.image 
      ? genAI.getGenerativeModel({ model: "gemini-pro-vision" })
      : genAI.getGenerativeModel({ model: "gemini-pro" });

    if (lastMessage.image) {
      const result = await model.generateContent([
        { text: lastMessage.content },
        {
          inlineData: {
            mimeType: lastMessage.image.mimeType,
            data: lastMessage.image.data
          }
        }
      ]);

      const response = await result.response;
      return NextResponse.json({ content: response.text() });
    } else {
      const chat = model.startChat({
        history: messages.map((msg: Message) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }))
      });

      const result = await chat.sendMessage(lastMessage.content);
      const response = await result.response;
      return NextResponse.json({ content: response.text() });
    }
  } catch (error: unknown) {
    console.error('Error calling Gemini API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}