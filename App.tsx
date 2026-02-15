
import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Lazy load components for performance
const HomePage = lazy(() => import('./pages/HomePage'));
const ToolPage = lazy(() => import('./pages/ToolPage'));
const BlogListPage = lazy(() => import('./pages/BlogListPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));


// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
  </div>
);

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
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              {/* Canonical Short URLs */}
              <Route path="/reels" element={<ToolPage type="reels" />} />
              <Route path="/stories" element={<ToolPage type="stories" />} />
              <Route path="/private-downloader" element={<ToolPage type="private" />} />
              <Route path="/profile-photo" element={<ToolPage type="profile" />} />

              {/* Redirects for Capitalized Variants */}
              <Route path="/Reels" element={<Navigate to="/reels" replace />} />
              <Route path="/Stories" element={<Navigate to="/stories" replace />} />
              <Route path="/Private-downloader" element={<Navigate to="/private-downloader" replace />} />
              <Route path="/Profile-photo" element={<Navigate to="/profile-photo" replace />} />

              {/* Redirects for Legacy Long URLs */}
              <Route path="/instagram-reel-downloader" element={<Navigate to="/reels" replace />} />
              <Route path="/instagram-story-downloader" element={<Navigate to="/stories" replace />} />
              <Route path="/instagram-profile-photo-downloader" element={<Navigate to="/profile-photo" replace />} />
              <Route path="/instagram-private-downloader" element={<Navigate to="/private-downloader" replace />} />
              <Route path="/instagram-reels-download" element={<Navigate to="/reels" replace />} />
              <Route path="/instagram-story-download" element={<Navigate to="/stories" replace />} />
              <Route path="/instagram-video-downloader" element={<ToolPage type="video" />} />
              <Route path="/instagram-photo-downloader" element={<ToolPage type="photo" />} />
              <Route path="/instagram-igtv-downloader" element={<ToolPage type="igtv" />} />
              <Route path="/instagram-video-download" element={<ToolPage type="video" />} />
              <Route path="/instagram-photo-download" element={<ToolPage type="photo" />} />
              <Route path="/instagram-igtv-download" element={<ToolPage type="igtv" />} />

              <Route path="/video" element={<ToolPage type="video" />} />
              <Route path="/photo" element={<ToolPage type="photo" />} />
              <Route path="/igtv" element={<ToolPage type="igtv" />} />

              <Route path="/blog" element={<BlogListPage />} />
              <Route path="/blog/:slug" element={<BlogPage />} />
              <Route path="/about" element={<About />} />

              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
