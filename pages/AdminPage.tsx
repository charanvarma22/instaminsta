import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../constants';

const AdminPage = () => {
    const [apiKey, setApiKey] = useState(localStorage.getItem('blog_api_key') || '');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [posts, setPosts] = useState([]);
    const [selectedPost, setSelectedPost] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [editContent, setEditContent] = useState('');
    const [editTitle, setEditTitle] = useState('');

    useEffect(() => {
        if (apiKey) {
            checkAuth();
        }
    }, []);

    const checkAuth = async () => {
        try {
            setLoading(true);
            // Try to fetch drafts to verify key
            const response = await axios.get(`${API_BASE_URL}/api/blog/admin/posts?status=draft`, {
                headers: { 'x-api-key': apiKey }
            });
            if (response.data.success) {
                setIsAuthenticated(true);
                setPosts(response.data.data);
                localStorage.setItem('blog_api_key', apiKey);
            }
        } catch (error) {
            alert('Invalid API Key or Connection Error');
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        checkAuth();
    };

    const fetchDrafts = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/blog/admin/posts?status=draft`, {
                headers: { 'x-api-key': apiKey }
            });
            setPosts(response.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openPost = async (id: number) => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/blog/admin/posts/${id}`, {
                headers: { 'x-api-key': apiKey }
            });
            setSelectedPost(response.data.data);
            setEditContent(response.data.data.content);
            setEditTitle(response.data.data.title);
        } catch (error) {
            console.error(error);
            alert('Failed to load post');
        } finally {
            setLoading(false);
        }
    };

    const handlePublish = async () => {
        if (!selectedPost) return;
        if (!window.confirm('Are you sure you want to PUBLISH this post?')) return;

        setLoading(true);
        try {
            await axios.put(`${API_BASE_URL}/api/blog/admin/posts/${selectedPost.blog_id}`, {
                title: editTitle,
                content: editContent,
                slug: selectedPost.slug,
                excerpt: selectedPost.excerpt,
                status: 'published'
            }, {
                headers: { 'x-api-key': apiKey }
            });
            alert('Post Published Successfully!');
            setSelectedPost(null);
            fetchDrafts();
        } catch (error) {
            console.error(error);
            alert('Failed to publish');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveDraft = async () => {
        if (!selectedPost) return;

        setLoading(true);
        try {
            await axios.put(`${API_BASE_URL}/api/blog/admin/posts/${selectedPost.blog_id}`, {
                title: editTitle,
                content: editContent,
                slug: selectedPost.slug,
                excerpt: selectedPost.excerpt,
                status: 'draft'
            }, {
                headers: { 'x-api-key': apiKey }
            });
            alert('Draft Saved!');
            // Refresh check
        } catch (error) {
            console.error(error);
            alert('Failed to save draft');
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <form onSubmit={handleLogin} className="p-8 bg-white rounded shadow-md">
                    <h1 className="mb-4 text-2xl font-bold">Admin Login</h1>
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter BLOG_API_KEY"
                        className="w-full p-2 mb-4 border rounded"
                    />
                    <button type="submit" className="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-600">
                        {loading ? 'Checking...' : 'Login'}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8 bg-gray-50 text-gray-800">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between mb-8">
                    <h1 className="text-3xl font-bold text-blue-600">Blog Admin Dashboard</h1>
                    <button onClick={() => { setIsAuthenticated(false); localStorage.removeItem('blog_api_key'); }} className="text-red-500">Logout</button>
                </header>

                {selectedPost ? (
                    <div className="bg-white p-6 rounded shadow">
                        <div className="flex justify-between mb-4">
                            <button onClick={() => setSelectedPost(null)} className="text-gray-500 hover:text-gray-700">← Back to Drafts</button>
                            <div className="space-x-2">
                                <button onClick={handleSaveDraft} disabled={loading} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Save Draft</button>
                                <button onClick={handlePublish} disabled={loading} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">PUBLISH NOW</button>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Title</label>
                            <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full p-2 border rounded font-bold text-lg"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Content (Markdown)</label>
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full p-4 border rounded font-mono h-[500px]"
                            />
                        </div>
                    </div>
                ) : (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Pending Drafts ({posts.length})</h2>
                        {loading && <p>Loading...</p>}
                        <div className="grid gap-4">
                            {posts.map((post: any) => (
                                <div key={post.blog_id} className="p-4 bg-white rounded shadow hover:shadow-md transition-shadow cursor-pointer border-l-4 border-yellow-400" onClick={() => openPost(post.blog_id)}>
                                    <h3 className="font-bold text-lg">{post.title}</h3>
                                    <p className="text-sm text-gray-500">Created: {new Date(post.created_at).toLocaleDateString()}</p>
                                    <p className="text-sm text-gray-500">Category: {post.category}</p>
                                    <span className="inline-block px-2 py-1 mt-2 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded">Draft</span>
                                </div>
                            ))}
                            {posts.length === 0 && !loading && <p className="text-gray-500">No drafts pending review.</p>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPage;
