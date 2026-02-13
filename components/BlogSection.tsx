import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../constants';

interface BlogPost {
  blog_id: number;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  published_at: string;
  view_count: number;
}

interface Props {
  limit?: number;
}

const BlogSection: React.FC<Props> = ({ limit }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Only fetch if we are in a valid environment, otherwise fallback to empty or static
        const response = await axios.get(`${API_BASE_URL}/api/blog/posts?limit=${limit || 3}`);
        if (response.data.success && response.data.data.length > 0) {
          setPosts(response.data.data);
        } else {
          // Fallback if no posts exist yet
          setPosts([]);
        }
      } catch (error) {
        console.error('Failed to load blog posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [limit]);

  if (!loading && posts.length === 0) return null; // Don't show section if no posts

  return (
    <section className="py-24 bg-transparent">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-4xl font-black text-white mb-4">Inside instaminsta</h2>
            <p className="text-slate-400 text-lg font-medium">Expert guides, industry news, and social media growth tips.</p>
          </div>
          <Link to="/blog" className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all border border-slate-700">
            Visit Blog &rarr;
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-10">
          {posts.map(post => (
            <Link key={post.slug} to={`/blog/${post.slug}`} className="group bg-slate-900/40 rounded-[3rem] overflow-hidden border border-slate-800 hover:border-pink-500/30 transition-all shadow-2xl flex flex-col md:flex-row">
              <div className="md:w-2/5 h-64 md:h-auto overflow-hidden bg-slate-800 flex items-center justify-center">
                {/* Placeholder API doesn't return images yet, using pattern */}
                <span className="text-4xl">📝</span>
              </div>
              <div className="md:w-3/5 p-10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-xs font-black text-pink-500 uppercase tracking-widest">{post.category}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                    <span className="text-xs text-slate-500 font-bold">
                      {new Date(post.published_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white leading-tight group-hover:text-pink-500 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>
                <div className="mt-8 text-white font-black text-sm uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
                  Read Article <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
