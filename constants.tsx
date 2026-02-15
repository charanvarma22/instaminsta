
import React from 'react';
import { NavLink, FAQItem, BlogPost } from './types';

// Change this to your VPS IP or Domain when deploying
export const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3004'
  : '';

export const WORDPRESS_API_URL = 'https://instaminsta.com/blog/wp-json/wp/v2';

export const NAV_LINKS: NavLink[] = [
  { name: 'Instagram Reels', path: '/reels', type: 'reels' },
  { name: 'Instagram Video', path: '/instagram-video-downloader', type: 'video' },
  { name: 'Instagram Photo', path: '/instagram-photo-downloader', type: 'photo' },
  { name: 'Instagram Story', path: '/stories', type: 'stories' },
  { name: 'Instagram IGTV', path: '/instagram-igtv-downloader', type: 'igtv' },
  { name: 'Marketing Blog', path: '/blog', type: 'all' },
];

export const TOOL_TABS = [
  { id: 'reels', label: 'Reels', icon: '🎬', path: '/reels' },
  { id: 'video', label: 'Video', icon: '📹', path: '/instagram-video-downloader' },
  { id: 'photo', label: 'Photo', icon: '🖼️', path: '/instagram-photo-downloader' },
  { id: 'stories', label: 'Stories', icon: '🕒', path: '/stories' },
  { id: 'igtv', label: 'IGTV', icon: '📺', path: '/instagram-igtv-downloader' },
];

export const FAQS: FAQItem[] = [
  {
    question: "How to use the Instagram Reels Downloader?",
    answer: "To use the Instagram Reels Downloader, simply copy the URL of the Reel from the Instagram app. Visit instaminsta.com, paste the link into the download box, and click 'Download'. Our Reels downloader will process the request and let you save the high-quality MP4 file instantly."
  },
  {
    question: "Is instaminsta the best Instagram Downloader in 2026?",
    answer: "Yes, instaminsta is the premier Instagram Downloader and FastDL alternative, offering faster processing speeds, no intrusive ads, and direct access to high-definition (HD) and 4K Instagram content without requiring any login or software installation."
  },
  {
    question: "Can I download private Instagram Reels?",
    answer: "Currently, our Instagram Reels Downloader supports content from public accounts only. We prioritize user privacy and comply with standard web protocols, ensuring a safe experience for all our users."
  },
  {
    question: "Does the Reels downloader work on iPhone and Android?",
    answer: "Absolutely. Our Instagram downloader is fully compatible with iPhone, Android, and PC. On mobile, just use your browser to paste the link and save the Reel directly to your gallery."
  },
  {
    question: "Is there a watermark on the downloaded Instagram videos?",
    answer: "No. Unlike other tools, instaminsta provides clean, watermark-free Instagram downloads. You get the original Reels or video file exactly as it was uploaded."
  },
  {
    question: "Is it anonymous to save Instagram Stories?",
    answer: "Yes. Our Instagram Story Saver acts as an anonymous viewer. The account owner will not see your profile in their view list because the content is fetched through our secure servers."
  },
  {
    question: "What is the maximum resolution for Instagram downloads?",
    answer: "We fetch the highest quality possible. For photos, this is usually 1080p. For Instagram Reels and videos, we provide the original 1080p HD source file."
  },
  {
    question: "Is this Instagram Downloader free?",
    answer: "Yes, instaminsta is a 100% free and unlimited Instagram downloader. We don't have hidden fees or limits on how many Reels you can save per day."
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    title: "How to Explode Your Reach with Instagram Reels in 2026",
    excerpt: "The 2026 algorithm favors high-retention short-form video. Learn the 5 hooks that are driving 1M+ views for creators right now.",
    date: "November 10, 2026",
    image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=800",
    category: "Strategy",
    content: "Detailed strategy for 2026 viral growth..."
  },
  {
    id: '2',
    title: "Top 10 Instagram Marketing Trends You Can't Ignore",
    excerpt: "From AI-generated carousels to the resurgence of IGTV, stay ahead of the curve with these essential marketing shifts.",
    date: "November 5, 2026",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
    category: "Marketing",
    content: "Analysis of current digital trends..."
  }
];

export const TOOL_SEO_CONTENT = {
  reels: {
    title: "Instagram Reels Downloader Online",
    h2: "The Best Tool to Download Instagram Reels in HD",
    p1: "Instaminsta is your ultimate **Instagram Reels Downloader**. We provide a fast, secure, and completely free way to save any Reel directly from Instagram's CDN. Whether you need to download viral Reels for offline viewing or content creation, our platform ensures the highest quality results without any watermarks.",
    p2: "As the best **IG Reels downloader** in 2026, we support all major browsers and devices. Simply paste the Reel link and our system will fetch the original 1080p MP4 file for you. Join millions of users who trust Instaminsta for their Instagram video downloading needs."
  },
  video: {
    title: "Fast Instagram Video Downloader MP4",
    h2: "The Fastest Way to Save Instagram Feed Videos",
    p1: "Need to save an informative video or a stunning travel vlog? Our Instagram Video Downloader is optimized for speed. We use advanced caching and multi-thread fetching to provide download links 10x faster than standard online tools.",
    p2: "Our service is a perfect FastDL alternative, offering a cleaner interface and more reliable server uptime. No more broken links or slow loading times—just paste, click, and save."
  },
  photo: {
    title: "High-Resolution Instagram Photo Downloader",
    h2: "Download Original Quality JPEGs from Instagram",
    p1: "Instagram compresses images significantly, but our tool finds the highest-resolution original file hidden in the source. Save individual photos or download all images from a carousel post in one go.",
    p2: "Perfect for photographers, designers, and mood board creators who need uncompressed visuals. instaminsta is the safest choice for high-res Instagram photo saving in 2026."
  },
  profile: {
    title: "Full-Size Instagram Profile Photo Downloader",
    h2: "View and Download HD Instagram Profile Pictures",
    p1: "Curious about someone's profile picture? Our tool lets you view and download any Instagram profile picture in its original, full-size HD quality. Just enter the username and you're good to go.",
    p2: "It's fast, anonymous, and you don't need to log in. The perfect tool for when you need to see the details."
  },
  private: {
    title: "Instagram Private Video & Photo Downloader",
    h2: "Securely Download from Private Instagram Accounts",
    p1: "Our private downloader allows you to securely access and download photos and videos from Instagram accounts you follow, even if they are private. Your privacy and security are our top priority.",
    p2: "The process is simple and requires authentication through a secure portal to ensure you have the necessary permissions. We never store your login information."
  },
  stories: {
    title: "Anonymous Instagram Story Saver & Viewer",
    h2: "Watch and Save Instagram Stories Privately",
    p1: "Stories disappear in 24 hours, but with our Story Saver, you can keep them forever. Our tool also acts as an anonymous viewer, allowing you to stay updated with accounts without appearing in their 'seen' list.",
    p2: "This is a critical tool for competitive research and personal archiving. We ensure your identity remains 100% private while you browse and download expiring content."
  },
  igtv: {
    title: "Free IGTV Downloader for Long-Form Video",
    h2: "Download Large IGTV Files Quickly",
    p1: "IGTV videos are often long and hard to save. Our downloader is specifically tuned for large file sizes, ensuring the connection doesn't drop during long downloads. Save educational content, interviews, and documentaries in 1080p.",
    p2: "Compatible with all mobile and desktop browsers, our IGTV saver is the professional choice for archiving long-form social media content in 2026."
  }
};
