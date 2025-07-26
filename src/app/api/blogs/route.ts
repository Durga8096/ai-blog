import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);


interface Blog {
  id: string;
  title: string;
  topic: string;
  content: string;
  createdAt: string;
}


let blogs: Blog[] = [];

// 1. POST - Generate new blog post using Gemini AI
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { topic } = body;
    
   
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return NextResponse.json(
        { error: 'Topic is required and must be a non-empty string' }, 
        { status: 400 }
      );
    }
    
    if (topic.trim().length > 100) {
      return NextResponse.json(
        { error: 'Topic must be less than 100 characters' }, 
        { status: 400 }
      );
    }
    
    const cleanTopic = topic.trim();
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' }, 
        { status: 500 }
      );
    }
    
   
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `Write a comprehensive, engaging, and well-structured blog post about: "${cleanTopic}"

REQUIREMENTS:
- Write a detailed blog post with at least 800-1200 words
- Use ## for main section headings (not #)
- Use ### for subsections
- Use regular paragraphs for content
- For lists, use simple bullet points with dashes (-)
- Use **text** ONLY for important keywords or phrases that need emphasis
- DO NOT use asterisks (*) for anything else
- DO NOT use single asterisks for bullet points
- Write in a professional, engaging, and informative tone
- Include practical examples and actionable insights
- Structure: Introduction, 3-5 main sections, conclusion
- Each section should have 2-3 substantial paragraphs
- Make it valuable and informative for readers

STRICT FORMATTING RULES:
- Never use * for bullet points (use - instead)
- Never use * for emphasis (use **text** for bold only)
- Never start lines with single *
- Keep formatting clean and minimal
- Focus on readability and content quality
- Ensure the content is original and valuable

Write a comprehensive blog post following these guidelines exactly.`;

    const result = await model.generateContent(prompt);
    const content = result.response.text();
    
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Failed to generate content' }, 
        { status: 500 }
      );
    }
    
    
    const newBlog: Blog = {
      id: uuidv4(),
      title: cleanTopic.charAt(0).toUpperCase() + cleanTopic.slice(1),
      topic: cleanTopic.toLowerCase(),
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };
    
    
    blogs.unshift(newBlog);
    
    return NextResponse.json(newBlog, { status: 201 });
    
  } catch (error: any) {
    console.error('Error generating blog post:', error);
    
    // Handle specific Gemini API errors
    if (error.message?.includes('API key')) {
      return NextResponse.json(
        { error: 'Invalid API key configuration' }, 
        { status: 500 }
      );
    }
    
    if (error.message?.includes('quota')) {
      return NextResponse.json(
        { error: 'API quota exceeded. Please try again later.' }, 
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to generate blog post. Please try again.' }, 
      { status: 500 }
    );
  }
}

// 2. GET - Fetch all blogs with optional filtering
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const topic = searchParams.get('topic');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const offset = parseInt(searchParams.get('offset') || '0');
    
    let filteredBlogs = [...blogs];
    
    
    if (search && search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filteredBlogs = filteredBlogs.filter(blog => 
        blog.title.toLowerCase().includes(searchLower) ||
        blog.content.toLowerCase().includes(searchLower) ||
        blog.topic.toLowerCase().includes(searchLower)
      );
    }
    
    
    if (topic && topic.trim()) {
      const topicLower = topic.toLowerCase().trim();
      filteredBlogs = filteredBlogs.filter(blog => 
        blog.topic.toLowerCase().includes(topicLower)
      );
    }
    
   
    filteredBlogs.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'topic':
          aValue = a.topic.toLowerCase();
          bValue = b.topic.toLowerCase();
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
      }
      
      if (order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    
    const total = filteredBlogs.length;
    if (limit) {
      filteredBlogs = filteredBlogs.slice(offset, offset + limit);
    }
    
    return NextResponse.json({ 
      blogs: filteredBlogs, 
      total: total,
      totalBlogs: blogs.length,
      offset: offset,
      limit: limit || total,
      hasMore: limit ? (offset + limit) < total : false
    });
    
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blogs' }, 
      { status: 500 }
    );
  }
}

// 3. DELETE - Delete a specific blog post by ID
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Blog ID is required' }, 
        { status: 400 }
      );
    }
    
    const initialLength = blogs.length;
    blogs = blogs.filter(blog => blog.id !== id);
    
    if (blogs.length === initialLength) {
      return NextResponse.json(
        { error: 'Blog post not found' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      message: 'Blog post deleted successfully',
      deletedId: id,
      remainingCount: blogs.length
    });
    
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog post' }, 
      { status: 500 }
    );
  }
}

// 4. PATCH - Advanced filtering (using PATCH to avoid conflicts with GET)
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { 
      search, 
      topics, 
      dateFrom, 
      dateTo, 
      sortBy = 'createdAt', 
      order = 'desc',
      limit,
      offset = 0
    } = body;
    
    let filteredBlogs = [...blogs];
    
    
    if (search && search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filteredBlogs = filteredBlogs.filter(blog => 
        blog.title.toLowerCase().includes(searchLower) ||
        blog.content.toLowerCase().includes(searchLower) ||
        blog.topic.toLowerCase().includes(searchLower)
      );
    }
    
   
    if (topics && Array.isArray(topics) && topics.length > 0) {
      filteredBlogs = filteredBlogs.filter(blog => 
        topics.some(topic => 
          blog.topic.toLowerCase().includes(topic.toLowerCase())
        )
      );
    }
    
    
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filteredBlogs = filteredBlogs.filter(blog => 
        new Date(blog.createdAt) >= fromDate
      );
    }
    
    if (dateTo) {
      const toDate = new Date(dateTo);
      filteredBlogs = filteredBlogs.filter(blog => 
        new Date(blog.createdAt) <= toDate
      );
    }
    
    
    filteredBlogs.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'topic':
          aValue = a.topic.toLowerCase();
          bValue = b.topic.toLowerCase();
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
      }
      
      if (order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    
    const total = filteredBlogs.length;
    if (limit) {
      filteredBlogs = filteredBlogs.slice(offset, offset + limit);
    }
    
    return NextResponse.json({
      blogs: filteredBlogs,
      total,
      totalBlogs: blogs.length,
      offset,
      limit: limit || total,
      hasMore: limit ? (offset + limit) < total : false,
      filters: {
        search,
        topics,
        dateFrom,
        dateTo,
        sortBy,
        order
      }
    });
    
  } catch (error) {
    console.error('Error filtering blogs:', error);
    return NextResponse.json(
      { error: 'Failed to filter blogs' }, 
      { status: 500 }
    );
  }
}

// Helper function to get blog statistics (can be called internally)
export function getBlogStats() {
  const topicCount = blogs.reduce((acc, blog) => {
    acc[blog.topic] = (acc[blog.topic] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    totalBlogs: blogs.length,
    uniqueTopics: Object.keys(topicCount).length,
    topicDistribution: topicCount,
    latestBlog: blogs.length > 0 ? blogs[0] : null,
    oldestBlog: blogs.length > 0 ? blogs[blogs.length - 1] : null,
    averageContentLength: blogs.length > 0 
      ? Math.round(blogs.reduce((sum, blog) => sum + blog.content.length, 0) / blogs.length)
      : 0
  };
}