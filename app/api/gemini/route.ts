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
    //   : genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    if (lastMessage.image) {
      const result = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [
            { text: lastMessage.content },
            {
              inlineData: {
                mimeType: lastMessage.image.mimeType,
                data: lastMessage.image.data
              }
            }
          ]
        }]
      });

      const response = await result.response;
      return NextResponse.json({ content: response.text() });
    } else {
      const chat = model.startChat({
        history: messages
          .filter(msg => msg.role !== 'system')
          .map((msg: Message) => {
            return {
              role: msg.role === 'assistant' ? 'user' : 'user',
              parts: [{ text: msg.content }]
            };
          })
          .sort((a, b) => {
            if (a.role === 'user') return -1;
            if (b.role === 'user') return 1;
            return 0;
          })
      });

      try {
        const result = await chat.sendMessage(lastMessage.content);
        const response = await result.response;
        return NextResponse.json({ content: response.text() });
      } catch (error) {
        console.error('Detailed Gemini error:', error);
        return NextResponse.json({ 
          content: `🚫 Ошибка Gemini API:\n${error instanceof Error ? error.message : 'Неизвестная ошибка'}\n\nСообщения:\n${JSON.stringify(messages.map(m => ({role: m.role, content: m.content.substring(0, 100)})), null, 2)}`,
        });
      }
    }
  } catch (error: unknown) {
    console.error('Error calling Gemini API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}