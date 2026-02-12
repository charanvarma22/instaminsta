
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { analyzeInstagramUrl } from '../services/geminiService';
import { TOOL_TABS, API_BASE_URL } from '../constants';

interface MediaItem {
  id: number;
  type: string;
  thumbnail: string;
  mediaUrl: string;
  shortcode: string | null;
}

interface Props {
  title: string;
  description: string;
}

const DownloaderTool: React.FC<Props> = ({ title, description }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | { type: string; items: MediaItem[]; shortcode: string | null }>(null);
  const [error, setError] = useState('');
  const [aiInfo, setAiInfo] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !url.includes('instagram.com')) {
      setError('Please enter a valid Instagram URL');
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);
    setAiInfo('');

    try {
      // 1. Get AI Analysis (optional, runs in parallel)
      analyzeInstagramUrl(url).then(analysis => setAiInfo(analysis || ''));

      // 2. Call real backend preview
      const response = await fetch(`${API_BASE_URL}/api/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to fetch media');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const triggerRealDownload = async (itemIndex?: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          itemIndex: itemIndex !== undefined ? itemIndex : undefined
        })
      });

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;

      // Dynamic Filename & Extension Logic
      let filename = 'instagram_media';
      let extension = '.mp4'; // Default to mp4

      if (itemIndex !== undefined) {
        // Individual item from carousel or single
        const item = result?.items.find((i: any) => i.id === itemIndex);
        if (item) {
          extension = item.type === 'video' ? '.mp4' : '.jpg';
          filename = `instagram_${item.type}_${itemIndex}${extension}`;
        }
      } else if (result?.type !== 'carousel') {
        // Single non-carousel item
        const item = result?.items[0];
        if (item) {
          extension = item.type === 'video' ? '.mp4' : '.jpg';
          filename = `instagram_${item.type}${extension}`;
        }
      } else {
        // Entire carousel as ZIP
        filename = 'instagram_gallery.zip';
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download media. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-16 md:py-24 text-center">
      <div className="mb-8">
        <h1 className="text-4xl md:text-7xl font-black mb-6 tracking-tight text-white">
          instaminsta <span className="hero-text-gradient">{title}</span> Downloader
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
          {description}
        </p>
      </div>

      <div className="max-w-3xl mx-auto mb-16">
        <div className="flex flex-wrap justify-center gap-2 mb-6 p-1 bg-slate-900/50 rounded-2xl border border-slate-800 backdrop-blur">
          {TOOL_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${location.pathname === tab.path
                ? 'bg-slate-700 text-white shadow-lg'
                : 'text-slate-500 hover:text-white hover:bg-slate-800'
                }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleDownload} className="relative group">
          <div className="flex flex-col md:flex-row items-stretch gap-0 p-1.5 bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-3xl border border-slate-800 focus-within:border-pink-500/30 focus-within:ring-8 focus-within:ring-pink-500/5 transition-all">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste Instagram link here..."
              className="flex-grow px-8 py-6 bg-transparent text-white focus:outline-none text-xl placeholder-slate-500 font-medium"
            />
            <button
              type="submit"
              disabled={loading || !url}
              className="bg-white text-slate-950 px-12 py-5 md:m-1.5 rounded-2xl font-black text-xl hover:bg-slate-200 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
            >
              {loading ? (
                <svg className="animate-spin h-7 w-7 text-slate-900" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download
                </span>
              )}
            </button>
          </div>
          {error && <p className="text-red-400 mt-4 text-sm font-bold">{error}</p>}
        </form>
        <p className="mt-4 text-slate-500 text-xs font-medium">
          By using our service you accept our <a href="#" className="underline hover:text-slate-300">Terms of Service</a> and <a href="#" className="underline hover:text-slate-300">Privacy Policy</a>.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-12 text-center max-w-4xl mx-auto opacity-60">
        <div className="flex flex-col items-center">
          <svg className="w-8 h-8 mb-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Secure</span>
        </div>
        <div className="flex flex-col items-center">
          <svg className="w-8 h-8 mb-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">No Login</span>
        </div>
        <div className="flex flex-col items-center">
          <svg className="w-8 h-8 mb-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Fast</span>
        </div>
        <div className="flex flex-col items-center">
          <svg className="w-8 h-8 mb-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">HD Quality</span>
        </div>
      </div>

      {result && result.items && result.items.length > 0 && (
        <div className="mt-16 bg-slate-900/60 rounded-[3rem] shadow-4xl overflow-hidden border border-slate-800 text-left backdrop-blur-xl animate-in zoom-in-95 duration-500">
          <div className="md:flex">
            <div className="md:w-1/2 p-3">
              <img
                src={result.items[0].thumbnail}
                alt="Preview"
                className="w-full h-[450px] object-cover rounded-[2.5rem] shadow-2xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/error/600/400';
                }}
              />
            </div>
            <div className="md:w-1/2 p-10 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-green-500 font-black text-xs uppercase tracking-widest">Server Processing Complete</span>
              </div>
              <h3 className="text-4xl font-black mb-6 text-white leading-tight">Your Media is Ready</h3>
              <p className="text-slate-400 leading-relaxed mb-10 font-medium text-lg">
                {aiInfo || "We have successfully fetched your Instagram media in original high-definition quality. Click the button below to start your direct download."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => triggerRealDownload(result.items[0].id)}
                  className="flex-grow bg-white text-slate-950 py-6 rounded-2xl font-black text-xl hover:bg-slate-200 transition-all active:scale-95 shadow-2xl shadow-white/10"
                >
                  Download {result.type === 'carousel' ? 'This Item' : 'HD Now'}
                </button>
                {result.type === 'carousel' && (
                  <button
                    onClick={() => triggerRealDownload()}
                    className="flex-grow bg-slate-800 text-white py-6 rounded-2xl font-black text-xl hover:bg-slate-700 transition-all active:scale-95"
                  >
                    Download Gallery (ZIP)
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Carousel Preview Strip */}
          {result.type === 'carousel' && result.items.length > 1 && (
            <div className="p-8 border-t border-slate-800 bg-slate-950/30">
              <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-4">Gallery Items ({result.items.length})</p>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {result.items.map((item, idx) => (
                  <div key={idx} className="flex-shrink-0 relative group cursor-pointer" onClick={() => triggerRealDownload(item.id)}>
                    <img src={item.thumbnail} className="w-24 h-24 object-cover rounded-xl border border-slate-700 hover:border-pink-500 transition-all" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl transition-all">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DownloaderTool;
