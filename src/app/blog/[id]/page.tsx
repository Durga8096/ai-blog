'use client';

import { useParams } from 'next/navigation';
import { JSX, useEffect, useState } from 'react';
import { Blog } from '../../type';

const formatContent = (content: string) => {
  let cleanedContent = content
    .replace(/\*{3,}/g, '**')
    .replace(/^\s*(\*+)\s+/gm, '• ')
    .replace(/\*{2,}/g, '')
    .replace(/^\s*\#{3,}\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n');

  const sections = cleanedContent.split(/\n\s*\n/);

  return sections.map((section, index) => {
    const trimmedSection = section.trim();
    if (!trimmedSection) return null;

    if (trimmedSection.startsWith('#')) {
      const level = trimmedSection.match(/^#+/)?.[0].length || 1;
      const text = trimmedSection.replace(/^#+\s*/, '');
      const HeaderTag = `h${Math.min(level + 1, 6)}` as keyof JSX.IntrinsicElements;
      return (
        <HeaderTag
          key={index}
          className={`font-bold mt-8 mb-4 text-gray-800 ${
            level === 1 ? 'text-3xl' : level === 2 ? 'text-2xl' : level === 3 ? 'text-xl' : 'text-lg'
          }`}
        >
          {text}
        </HeaderTag>
      );
    }

    if (trimmedSection.startsWith('**') && trimmedSection.endsWith('**') && !trimmedSection.includes('\n')) {
      const text = trimmedSection.replace(/^\*\*|\*\*$/g, '');
      return (
        <h3 key={index} className="text-2xl font-bold mt-8 mb-4 text-gray-800">
          {text}
        </h3>
      );
    }

    if (/^\*?\*?\d+\.\s*\*?\*?/.test(trimmedSection)) {
      const text = trimmedSection.replace(/^\*?\*?\d+\.\s*\*?\*?/, '').replace(/\*\*$/, '');
      return (
        <h3 key={index} className="text-2xl font-bold mt-8 mb-4 text-gray-800">
          {text}
        </h3>
      );
    }

    if (
      (trimmedSection === trimmedSection.toUpperCase() && trimmedSection.length < 100 && trimmedSection.length > 5) ||
      (trimmedSection.endsWith(':') && trimmedSection.length < 100)
    ) {
      return (
        <h4 key={index} className="text-xl font-semibold mt-6 mb-3 text-gray-800">
          {trimmedSection}
        </h4>
      );
    }

    if (
      trimmedSection.includes('•') ||
      (trimmedSection.includes('*') && trimmedSection.split('\n').length > 1) ||
      trimmedSection.includes('\n-') ||
      /Benefits:|How to use it:/.test(trimmedSection)
    ) {
      const lines = trimmedSection.split('\n').filter((line) => line.trim());
      let currentList: string[] = [];
      let result = [];

      lines.forEach((line, lineIndex) => {
        const cleanLine = line.trim();

        if (
          cleanLine.startsWith('•') ||
          cleanLine.startsWith('*') ||
          cleanLine.startsWith('-') ||
          (lineIndex > 0 && cleanLine.length > 0 && !cleanLine.endsWith(':'))
        ) {
          const itemText = cleanLine.replace(/^[•\*\-]\s*/, '').replace(/^\*\*|\*\*$/g, '');
          if (itemText) {
            currentList.push(itemText);
          }
        } else {
          if (currentList.length > 0) {
            result.push(
              <ul key={`${index}-list-${result.length}`} className="list-disc list-inside space-y-3 mb-6 ml-4">
                {currentList.map((item, itemIndex) => (
                  <li key={itemIndex} className="text-gray-700 leading-relaxed">
                    <span
                      dangerouslySetInnerHTML={{
                        __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
                      }}
                    />
                  </li>
                ))}
              </ul>
            );
            currentList = [];
          }

          if (cleanLine) {
            if (cleanLine.endsWith(':') || /^(Benefits|How to use it):/i.test(cleanLine)) {
              result.push(
                <h5 key={`${index}-subheader-${result.length}`} className="text-lg font-semibold mt-6 mb-3 text-gray-800">
                  {cleanLine}
                </h5>
              );
            } else {
              result.push(
                <p key={`${index}-text-${result.length}`} className="text-gray-700 leading-relaxed mb-4">
                  <span
                    dangerouslySetInnerHTML={{
                      __html: cleanLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
                    }}
                  />
                </p>
              );
            }
          }
        }
      });

      if (currentList.length > 0) {
        result.push(
          <ul key={`${index}-list-final`} className="list-disc list-inside space-y-3 mb-6 ml-4">
            {currentList.map((item, itemIndex) => (
              <li key={itemIndex} className="text-gray-700 leading-relaxed">
                <span
                  dangerouslySetInnerHTML={{
                    __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
                  }}
                />
              </li>
            ))}
          </ul>
        );
      }

      return <div key={index}>{result}</div>;
    }

    const formattedText = trimmedSection
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">$1</code>');

    return (
      <p key={index} className="text-gray-700 leading-relaxed mb-6 text-base sm:text-lg">
        <span dangerouslySetInnerHTML={{ __html: formattedText }} />
      </p>
    );
  }).filter(Boolean);
};

export default function BlogPage() {
  const { id } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBlog = () => {
      try {
        const blogs = JSON.parse(localStorage.getItem('blogs') || '[]');
        const found = blogs.find((b: Blog) => b.id === id);
        setBlog(found || null);
      } catch (error) {
        console.error('Error loading blog:', error);
        setBlog(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadBlog();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/5"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Blog Not Found</h2>
          <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist.</p>
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <a href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors text-sm">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Blog List
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <article className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 sm:px-8 py-6 sm:py-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight break-words">{blog.title}</h1>
            <div className="flex flex-wrap items-center text-blue-100 text-sm sm:text-base">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <time>
                {new Date(blog.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>
          </div>

          <div className="p-6 sm:p-8 md:p-12">
            <div className="prose prose-sm sm:prose lg:prose-lg max-w-none">{formatContent(blog.content)}</div>

            <footer className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row flex-wrap items-center justify-between gap-4">
                <div className="flex items-center text-gray-500 text-sm">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span>AI Generated Content</span>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() =>
                      navigator.share?.({
                        title: blog.title,
                        url: window.location.href,
                      })
                    }
                    className="text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342A3 3 0 119 12c0-.482-.114-.938-.316-1.342m0 2.684l6.632 3.316m-6.632-6l6.632-3.316" />
                    </svg>
                  </button>
                  <button onClick={() => window.print()} className="text-gray-500 hover:text-blue-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                  </button>
                </div>
              </div>
            </footer>
          </div>
        </article>

        <div className="mt-10 text-center px-4 sm:px-0">
          <a
            href="/"
            className="inline-flex items-center justify-center w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 rounded-xl shadow-md hover:shadow-xl transition-all hover:scale-105 text-sm sm:text-base"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Generate More Blogs
          </a>
        </div>
      </main>
    </div>
  );
}
