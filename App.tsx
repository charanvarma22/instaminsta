
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ToolPage from './pages/ToolPage';
import BlogListPage from './pages/BlogListPage';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/instagram-reel-downloader" element={<ToolPage type="reels" />} />
            <Route path="/instagram-post-downloader" element={<ToolPage type="video" />} />
            <Route path="/instagram-video-downloader" element={<ToolPage type="video" />} />
            <Route path="/instagram-photo-downloader" element={<ToolPage type="photo" />} />
            <Route path="/instagram-story-downloader" element={<ToolPage type="stories" />} />
            <Route path="/instagram-igtv-downloader" element={<ToolPage type="igtv" />} />
            <Route path="/instagram-reels-download" element={<ToolPage type="reels" />} />
            <Route path="/instagram-video-download" element={<ToolPage type="video" />} />
            <Route path="/instagram-photo-download" element={<ToolPage type="photo" />} />
            <Route path="/instagram-story-download" element={<ToolPage type="stories" />} />
            <Route path="/instagram-igtv-download" element={<ToolPage type="igtv" />} />
            <Route path="/reels" element={<ToolPage type="reels" />} />
            <Route path="/video" element={<ToolPage type="video" />} />
            <Route path="/photo" element={<ToolPage type="photo" />} />
            <Route path="/stories" element={<ToolPage type="stories" />} />
            <Route path="/igtv" element={<ToolPage type="igtv" />} />
            <Route path="/blog" element={<BlogListPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
