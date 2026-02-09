import express from 'express';
import { marked } from 'marked';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../database.js';

const router = express.Router();

// Helper for ESM path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize DOMPurify
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// ============================================
// MIDDLEWARE: API Key Authentication
// ============================================
const authenticateAPIKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        return res.status(401).json({
            success: false,
            error: 'API key required'
        });
    }

    // You should set BLOG_API_KEY in your .env file
    if (apiKey !== process.env.BLOG_API_KEY) {
        return res.status(403).json({
            success: false,
            error: 'Invalid API key'
        });
    }

    next();
};

// ============================================
// ENDPOINT: Publish New Blog
// POST /api/blog/publish
// ============================================
router.post('/publish', authenticateAPIKey, async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const {
            title,
            slug,
            content,
            excerpt,
            meta_title,
            meta_description,
            keyword,
            category,
            author_id = 1,
            status = 'published'
        } = req.body;

        // Validation
        if (!title || !slug || !content) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: title, slug, content'
            });
        }

        // Convert markdown to HTML and sanitize
        const htmlContent = DOMPurify.sanitize(marked.parse(content));

        // Start transaction
        await connection.beginTransaction();

        // Check if slug already exists
        const [existing] = await connection.query(
            'SELECT blog_id FROM blogs WHERE slug = ?',
            [slug]
        );

        if (existing.length > 0) {
            // Update if exists or return error? Typically n8n wants to avoid duplicates.
            await connection.rollback();
            return res.status(409).json({
                success: false,
                error: 'Blog with this slug already exists'
            });
        }

        // Insert blog post
        const [result] = await connection.query(
            `INSERT INTO blogs (
        title, slug, content, html_content, excerpt, 
        meta_title, meta_description, keyword, category, 
        author_id, status, view_count, created_at, updated_at, published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NOW(), NOW(), NOW())`,
            [
                title,
                slug,
                content,
                htmlContent,
                excerpt,
                meta_title || title,
                meta_description || excerpt,
                keyword,
                category,
                author_id,
                status
            ]
        );

        await connection.commit();

        res.status(201).json({
            success: true,
            message: 'Blog published successfully',
            data: {
                blog_id: result.insertId,
                slug: slug,
                url: `/blog/${slug}`
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error('Blog publish error:', error);
        res.status(500).json({ success: false, error: 'Failed to publish blog' });
    } finally {
        connection.release();
    }
});

// ============================================
// ENDPOINT: Get All Blogs (Public)
// GET /api/blog/posts
// ============================================
router.get('/posts', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT blog_id, title, slug, excerpt, keyword, category, published_at FROM blogs WHERE status = "published" ORDER BY published_at DESC'
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Fetch blogs error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch blogs' });
    }
});

// ============================================
// ENDPOINT: Get Single Blog (Public)
// GET /api/blog/posts/:slug
// ============================================
router.get('/posts/:slug', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM blogs WHERE slug = ? AND status = "published"',
            [req.params.slug]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Post not found' });
        }

        // Increment view count (simple)
        pool.query('UPDATE blogs SET view_count = view_count + 1 WHERE blog_id = ?', [rows[0].blog_id]);

        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Fetch blog detail error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch blog post' });
    }
});

// ============================================
// ENDPOINT: Update Sitemap (Called by n8n after publish)
// GET /api/sitemap/update
// ============================================
router.get('/sitemap/update', authenticateAPIKey, async (req, res) => {
    try {
        const [blogs] = await pool.query(
            "SELECT slug, updated_at, created_at FROM blogs WHERE status = 'published' ORDER BY created_at DESC"
        );

        const baseUrl = process.env.SITE_URL || 'https://instaminsta.com';
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        // Homepage & Static pages (hardcoded for simplicity in this helper)
        const staticPages = ['', 'reels', 'stories', 'private-downloader', 'profile-photo', 'blog'];
        staticPages.forEach(p => {
            xml += `  <url><loc>${baseUrl}/${p}</loc><changefreq>daily</changefreq><priority>${p === '' ? '1.0' : '0.9'}</priority></url>\n`;
        });

        // Blog items
        blogs.forEach(blog => {
            const lastmod = (blog.updated_at || blog.created_at).toISOString().split('T')[0];
            xml += `  <url>\n    <loc>${baseUrl}/blog/${blog.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
        });
        xml += '</urlset>';

        // NOTE: In production, the "public" folder might be in a different place relative to backend.
        // Assuming backend and public/dist are parallel on VPS.
        const sitemapPath = path.join(__dirname, '../../public/sitemap.xml');
        await fs.writeFile(sitemapPath, xml, 'utf8');

        res.json({ success: true, message: 'Sitemap updated successfully' });
    } catch (error) {
        console.error('Sitemap error:', error);
        res.status(500).json({ success: false, error: 'Sitemap update failed' });
    }
});

export default router;
