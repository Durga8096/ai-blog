import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();
    if (!topic) {
      throw new Error('No topic provided');
    }

    // Use free & fast Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Write a detailed, engaging blog post about: ${topic}

FORMATTING REQUIREMENTS:
- Use ## for main section headings
- Use ### for subsections  
- Use regular paragraphs for content
- For lists, use simple bullet points with dashes (-)
- Use **text** ONLY for important keywords or phrases that need emphasis
- DO NOT use asterisks (*) for anything else
- DO NOT use single asterisks for bullet points
- Write in a professional, engaging tone
- Include practical examples and actionable insights
- Structure: Introduction, 3-5 main sections, conclusion
- Each section should have 2-3 paragraphs minimum

STRICT RULES:
- Never use * for bullet points (use - instead)
- Never use * for emphasis (use **text** for bold only)
- Never start lines with single *
- Keep formatting clean and minimal
- Focus on readability and content quality

Write a comprehensive blog post following these guidelines exactly.`;

    const result = await model.generateContent(prompt);
    const content = result.response.text();

    const blog = {
      id: uuidv4(),
      title: topic.charAt(0).toUpperCase() + topic.slice(1),
      topic,
      content,
      createdAt: new Date().toLocaleString(),
    };

    return NextResponse.json(blog);
  } catch (error: any) {
    console.error('🔥 Gemini Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}