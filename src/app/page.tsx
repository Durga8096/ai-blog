'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import BlogCard from './components/blogCard';
import { BlogForm } from './components/blogForm';
import { SearchBar } from './components/searchBar';
import { Blog } from './type';

export default function HomePage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  // Load blogs from localStorage on mount
  useEffect(() => {
    setMounted(true);
    try {
      const savedBlogs = JSON.parse(localStorage.getItem('blogs') || '[]');
      setBlogs(savedBlogs);
    } catch (error) {
      console.error('Error loading blogs:', error);
    }
  }, []);

  // Save blogs to localStorage whenever blogs change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('blogs', JSON.stringify(blogs));
    }
  }, [blogs, mounted]);

  const handleGenerate = async (topic: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        body: JSON.stringify({ topic }),
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!res.ok) {
        throw new Error('Failed to generate blog');
      }
      
      const newBlog: Blog = await res.json();
      newBlog.createdAt = new Date().toISOString();
      setBlogs((prev) => [newBlog, ...prev]);
    } catch (error) {
      console.error('Error generating blog:', error);
      // You might want to show an error toast here
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setBlogs((prev) => prev.filter((b) => b.id !== id));
  };

  const filteredBlogs = blogs.filter((b) => 
    b?.title?.toLowerCase().includes(search.toLowerCase()) ||
    b?.content?.toLowerCase().includes(search.toLowerCase())
  );

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
            <div className="text-6xl mb-6"><Image src="/logo-2.png" alt="Logo" width={280} height={280} className="mx-auto" /></div>
            <p className="text-2xl mb-8 text-[#e6eefa] ">
              Transform any topic into engaging, well-structured blog posts using the power of AI
            </p>
          </motion.div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-8">
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
          {/* Section Header */}
          {blogs.length > 0 && (
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
                {filteredBlogs.length} {filteredBlogs.length === 1 ? 'post' : 'posts'}
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {!loading && blogs.length === 0 && (
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
                    <span key={topic} className="bg-white px-3 py-1 rounded-full text-sm text-gray-600 border">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* No Search Results */}
          {!loading && blogs.length > 0 && filteredBlogs.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                No posts found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search terms or generate new content
              </p>
            </motion.div>
          )}

          {/* Blog Posts List */}
          <AnimatePresence mode="popLayout">
            {filteredBlogs.map((blog, index) => (
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

        {/* Footer */}
        {blogs.length > 0 && (
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