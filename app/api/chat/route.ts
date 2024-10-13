import { NextRequest, NextResponse } from 'next/server';
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: "mixtral-8x7b-32768",
      temperature: 0.7,
      max_tokens: 1000,
    });

    return NextResponse.json({ 
      content: chatCompletion.choices[0].message.content 
    });
  } catch (error) {
    console.error('Error calling Groq API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


// export async function main() {
//     const chatCompletion = await getGroqChatCompletion();
//     // Print the completion returned by the LLM.
//     console.log(chatCompletion.choices[0]?.message?.content || "");
//   }
  
//   export async function getGroqChatCompletion() {
//     return groq.chat.completions.create({
//       messages: [
//         {
//           role: "user",
//           content: "Explain the importance of fast language models",
//         },
//       ],
//       model: "llama3-8b-8192",
//     });
//   }