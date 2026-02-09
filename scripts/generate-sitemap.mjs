import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.SITEMAP_BASE_URL || 'https://instaminsta.com';
const today = new Date().toISOString().slice(0, 10);

const routes = [
  '/',
  '/instagram-reel-downloader',
  '/instagram-post-downloader',
  '/instagram-video-downloader',
  '/instagram-photo-downloader',
  '/instagram-story-downloader',
  '/instagram-igtv-downloader',
  '/instagram-reels-download',
  '/instagram-video-download',
  '/instagram-photo-download',
  '/instagram-story-download',
  '/instagram-igtv-download',
  '/instagram-profile-photo-downloader',
  '/instagram-private-downloader',
  '/blog',
  '/about',
  '/contact',
  '/privacy',
  '/terms'
];

function buildEntry(loc, changefreq, priority) {
  return `  <url>
    <loc>${BASE_URL}${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
].join('\n') + '\n' +
[
  buildEntry('/', 'daily', '1.0'),
  ...routes.filter(r => r !== '/').map(r => buildEntry(r, 'weekly', '0.8'))
].join('\n') + '\n' +
'</urlset>\n';

const outPath = path.join(process.cwd(), 'public', 'sitemap.xml');
fs.writeFileSync(outPath, xml, 'utf8');
