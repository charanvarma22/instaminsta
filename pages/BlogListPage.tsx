import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../constants';
import SEO from '../components/SEO';

interface BlogPost {
  blog_id: number;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  published_at: string;
}

const BlogListPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/blog/posts`);
        if (response.data.success) {
          setPosts(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="bg-slate-950 min-h-screen pt-12 pb-24">
      <SEO
        title="InstamInsta Blog - Instagram Marketing & Content Tips"
        description="Expert guides on growing your Instagram presence, using Reels, and mastering social media marketing in 2026."
        canonical="/blog"
      />

      <div className="max-w-7xl mx-auto px-4 text-center mb-16">
        <h1 className="text-5xl md:text-7xl font-black mb-6 text-white leading-tight">
          InstamInsta <span className="hero-text-gradient">Blog</span>
        </h1>
        <p className="text-slate-400 text-xl max-w-2xl mx-auto font-medium">
          Master the art of Instagram content creation and marketing in 2026.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
          </div>
        ) : posts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="group bg-slate-900/40 rounded-[2.5rem] border border-slate-800 hover:border-pink-500/30 transition-all overflow-hidden flex flex-col"
              >
                <div className="p-8 flex flex-col h-full">
                  <span className="text-pink-500 font-bold text-xs uppercase tracking-widest mb-4">
                    {post.category || 'Strategy'}
                  </span>
                  <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-pink-400 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-grow">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-800/50">
                    <span className="text-slate-500 text-xs">
                      {new Date(post.published_at).toLocaleDateString()}
                    </span>
                    <span className="text-white font-bold text-sm group-hover:translate-x-2 transition-transform">
                      Read More →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-500">
            No posts published yet. Stay tuned!
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogListPage;
