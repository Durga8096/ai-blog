import Link from 'next/link';
import { Blog } from '../type';

export function BlogCard({ blog, onDelete }: { blog: Blog; onDelete: (id: string) => void }) {
  const getPreview = (content: string) => {
    const cleanContent = content
      .replace(/#{1,6}\s*/g, '')
      .replace(/\*{2,}/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/[•\-]\s*/g, '')
      .replace(/^\d+\.\s*/gm, '')
      .replace(/\*?([A-Za-z][^*:\n]*):?\*?\*?/g, '$1')
      .replace(/([a-z])\*([A-Z])/g, '$1 $2')
      .replace(/:\*\*\s*/g, ': ')
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (cleanContent.length <= 200) return cleanContent;

    const preview = cleanContent.substring(0, 200);
    const lastSentence = preview.lastIndexOf('.');
    const lastSpace = preview.lastIndexOf(' ');

    if (lastSentence > 150) {
      return preview.substring(0, lastSentence + 1);
    } else if (lastSpace > 150) {
      return preview.substring(0, lastSpace) + '...';
    }

    return preview + '...';
  };

  const handleReadMore = () => {
    const blogs: Blog[] = JSON.parse(localStorage.getItem('blogs') || '[]');
    if (!blogs.find((b) => b.id === blog.id)) {
      blogs.unshift(blog);
      localStorage.setItem('blogs', JSON.stringify(blogs));
    }
  };

  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 w-full max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-[1px]">
        <div className="bg-white m-[1px] rounded-xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-3 group-hover:text-blue-600 transition-colors leading-snug">
                {blog.title}
              </h2>
              <div className="flex items-center text-gray-500 text-sm">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <time>
                  {new Date(blog.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white text-xs px-3 py-1 rounded-full font-medium flex items-center self-start">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI Generated
            </div>
          </div>

          <div className="mb-4 sm:mb-6">
            <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
              {getPreview(blog.content)}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <Link
              href={`/blog/${blog.id}`}
              onClick={handleReadMore}
              className="inline-flex justify-center items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-md text-sm sm:text-base text-center"
            >
              <span className="font-medium">Read Full Article</span>
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-3">
              <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                ~{Math.ceil(blog.content.split(' ').length / 200)} min read
              </span>

              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this blog post?')) {
                    onDelete(blog.id);
                  }
                }}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                title="Delete blog post"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlogCard;
