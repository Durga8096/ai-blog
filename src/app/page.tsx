'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import BlogCard from './components/blogCard';
import { BlogForm } from './components/blogForm';
import { SearchBar } from './components/searchBar';
import { Blog } from './type';
import { s } from 'framer-motion/client';

export default function HomePage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [totalBlogs, setTotalBlogs] = useState<number>(0);

  // Load blogs from API on mount
  useEffect(() => {
    setMounted(true);
    fetchBlogs();
  }, []);

  // Fetch blogs from API with optional search
  const fetchBlogs = async (searchQuery?: string) => {
    try {
      let url = '/api/blogs';
      const params = new URLSearchParams();
      
      if (searchQuery && searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch blogs');
      }
      
      const data = await response.json();
      setBlogs(data.blogs || []);
      setTotalBlogs(data.totalBlogs || 0);
      setError('');
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setError(error instanceof Error ? error.message : 'Failed to load blog posts');
      setBlogs([]);
    }
  };

  // Handle search with debouncing
  useEffect(() => {
    if (!mounted) return;
    
    const debounceTimer = setTimeout(() => {
      if (search.trim()) {
        fetchBlogs(search);
      } else {
        fetchBlogs();
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [search, mounted]);

  // Generate new blog post using AI
  const handleGenerate = async (topic: string) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate blog');
      }
      
      const newBlog: Blog = await response.json();
      
      setBlogs((prev) => [newBlog, ...prev]);
      setTotalBlogs((prev) => prev + 1);
      
      if (search) {
        setSearch('');
      }
      
    } catch (error) {
      console.error('Error generating blog:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate blog post');
    } finally {
      setLoading(false);
    }
  };

  // Delete a specific blog post
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/blogs?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete blog');
      }
      
      
      setBlogs((prev) => prev.filter((blog) => blog.id !== id));
      setTotalBlogs((prev) => prev - 1);
      
     setError('Blog post deleted successfully');
      const successTimer = setTimeout(() => {
        setError('');
      }, 3000);
      
      return () => clearTimeout(successTimer);
      
    } catch (error) {
      console.error('Error deleting blog:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete blog post');
    }
  };

  
  useEffect(() => {
    if (error && !error.includes('delete')) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

 
  const filteredCount = blogs.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-6 py-[40px] text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-6xl mb-6">
              <Image src="/logo-2.png" alt="Logo" width={280} height={280} className="mx-auto" />
            </div>
            <p className="text-2xl mb-8 text-[#e6eefa]">
              Transform any topic into engaging, well-structured blog posts using the power of AI
            </p>
          </motion.div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center"
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-700 font-medium">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Blog Generation Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Create Your Next Blog Post
          </h2>
          <BlogForm onGenerate={handleGenerate} />
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <SearchBar value={search} onChange={setSearch} />
        </motion.div>

        {/* Loading State */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-lg p-8 text-center border border-blue-200"
            >
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="text-lg text-gray-700 font-medium">
                  Generating your amazing blog post...
                </span>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                This usually takes 10-30 seconds
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Blog Posts Section */}
        <section className="space-y-6">
        
          {totalBlogs > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center justify-between"
            >
              <h2 className="text-3xl font-bold text-gray-800">
                Your Blog Posts
              </h2>
              <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                {search ? (
                  <>
                    {filteredCount} of {totalBlogs} {totalBlogs === 1 ? 'post' : 'posts'}
                  </>
                ) : (
                  <>
                    {totalBlogs} {totalBlogs === 1 ? 'post' : 'posts'}
                  </>
                )}
              </div>
            </motion.div>
          )}

          
          {!loading && totalBlogs === 0 && !search && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center py-16"
            >
              <div className="text-6xl mb-6">📝</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                No blog posts yet
              </h3>
              <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                Start by entering a topic above to generate your first AI-powered blog post!
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 max-w-lg mx-auto">
                <h4 className="font-semibold text-gray-800 mb-2">💡 Try these topics:</h4>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['Machine Learning', 'Web Development', 'Digital Marketing', 'Health & Fitness'].map((topic) => (
                    <button
                      key={topic}
                      onClick={() => handleGenerate(topic)}
                      disabled={loading}
                      className="bg-white px-3 py-1 rounded-full text-sm text-gray-600 border 
                               hover:bg-gray-50 hover:border-blue-300 transition-colors
                               disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* No Results Found */}
          {!loading && totalBlogs > 0 && filteredCount === 0 && search && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                No posts found for "{search}"
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search terms or generate new content
              </p>
              <button
                onClick={() => setSearch('')}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Clear search
              </button>
            </motion.div>
          )}

          {/* Blog Posts List */}
          <AnimatePresence mode="popLayout">
            {blogs.map((blog, index) => (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ 
                  duration: 0.4, 
                  delay: Math.min(index * 0.1, 0.5)
                }}
                layout
              >
                <BlogCard blog={blog} onDelete={handleDelete} />
              </motion.div>
            ))}
          </AnimatePresence>
        </section>

        {totalBlogs > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center py-8 border-t border-gray-200"
          >
            <p className="text-gray-500 text-sm">
              ✨ Powered by AI • Generated with care • Ready to inspire
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}