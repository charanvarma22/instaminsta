import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../constants';
import SEO from '../components/SEO';

interface BlogPost {
    title: string;
    slug: string;
    html_content: string;
    meta_title: string;
    meta_description: string;
    category: string;
    published_at: string;
}

const BlogPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/blog/posts/${slug}`);
                if (response.data.success) {
                    setPost(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching blog post:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [slug]);

    if (loading) {
        return (
            <div className="bg-slate-950 min-h-screen flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="bg-slate-950 min-h-screen pt-32 text-center text-white">
                <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
                <Link to="/blog" className="text-pink-500 hover:underline">Back to Blog</Link>
            </div>
        );
    }

    return (
        <div className="bg-slate-950 min-h-screen pt-24 pb-32">
            <SEO
                title={post.meta_title || post.title}
                description={post.meta_description}
                canonical={`/blog/${post.slug}`}
            />

            <article className="max-w-4xl mx-auto px-4">
                <Link to="/blog" className="text-slate-500 hover:text-white transition-colors mb-8 inline-block font-bold">
                    ← Back to Articles
                </Link>

                <div className="mb-12">
                    <span className="text-pink-500 font-bold text-xs uppercase tracking-widest mb-4 inline-block">
                        {post.category || 'Strategy'}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
                        {post.title}
                    </h1>
                    <div className="flex items-center text-slate-400 text-sm">
                        <span>Published on {new Date(post.published_at).toLocaleDateString()}</span>
                        <span className="mx-3">•</span>
                        <span>By InstamInsta Editorial</span>
                    </div>
                </div>

                <div
                    className="prose prose-invert prose-pink max-w-none 
                               prose-headings:font-black prose-headings:text-white 
                               prose-p:text-slate-300 prose-p:leading-relaxed 
                               prose-a:text-pink-500 prose-a:no-underline hover:prose-a:underline
                               prose-strong:text-white prose-img:rounded-3xl"
                    dangerouslySetInnerHTML={{ __html: post.html_content }}
                />

                <div className="mt-20 p-12 bg-slate-900/50 border border-slate-800 rounded-[3rem] text-center">
                    <h3 className="text-3xl font-black text-white mb-4">Enjoyed this guide?</h3>
                    <p className="text-slate-400 mb-8 max-w-md mx-auto">
                        Download Instagram Reels and Photos in HD for free with InstamInsta.
                        No registration required.
                    </p>
                    <Link to="/" className="inline-block bg-white text-black font-black px-10 py-4 rounded-full hover:scale-105 transition-transform">
                        Explore Our Tools
                    </Link>
                </div>
            </article>
        </div>
    );
};

export default BlogPage;
