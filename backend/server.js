import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import axios from "axios";
import path from "path";
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import * as resolverModule from "./resolver.js";
import { fetchMediaByShortcode, fetchStoryByUrl, fetchIGTVByUrl, fetchProfileByUrl } from "./igApi.js";
import blogRoutes from './routes/blogApi.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from absolute path
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(bodyParser.json());

// Mount Blog API
app.use('/api/blog', blogRoutes);

// Rate Limiting
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 60, // Increased limit for better UX
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." }
});
app.use(limiter);

// Process Errors - Prevent infinite crash loop
process.on('uncaughtException', (err) => {
    console.error('CRITICAL: Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
});

// Logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

const resolver = resolverModule.default || resolverModule.resolver || resolverModule.resolve || resolverModule.resolveUrl;

// Legacy /resolve endpoint
app.post("/resolve", async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) return res.status(400).json({ error: "URL is required" });
        if (!resolver) return res.status(500).json({ error: "Resolver not found" });
        await resolver(url, res);
    } catch (err) {
        console.error("Backend error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Main Download endpoint
app.post("/api/download", async (req, res) => {
    try {
        const { url, itemIndex } = req.body;
        if (!url) return res.status(400).json({ error: "URL is required" });

        if (itemIndex !== undefined && itemIndex !== null) {
            const match = url.match(/\/(reel|p|tv)\/([^/?]+)/);
            if (match) {
                const shortcode = match[2];
                const media = await fetchMediaByShortcode(shortcode);
                if (media.carousel_media && media.carousel_media[itemIndex]) {
                    const item = media.carousel_media[itemIndex];
                    if (item.video_versions?.[0]) {
                        const videoUrl = item.video_versions[0].url;
                        res.setHeader("Content-Type", "video/mp4");
                        res.setHeader("Content-Disposition", `attachment; filename=carousel_${itemIndex}.mp4`);
                        const stream = await axios.get(videoUrl, { responseType: "stream" });
                        return stream.data.pipe(res);
                    }
                    if (item.image_versions2?.candidates?.[0]) {
                        const imgUrl = item.image_versions2.candidates[0].url;
                        res.setHeader("Content-Type", "image/jpeg");
                        res.setHeader("Content-Disposition", `attachment; filename=carousel_${itemIndex}.jpg`);
                        const stream = await axios.get(imgUrl, { responseType: "stream" });
                        return stream.data.pipe(res);
                    }
                }
            }
        }
        await resolver(url, res);
    } catch (err) {
        console.error("Backend error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

const handleError = resolverModule.handleError || resolverModule.default?.handleError;

// Preview endpoint
app.post("/api/preview", async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) return res.status(400).json({ error: "URL is required" });

        // 1. Stories
        if (url.includes("/stories/")) {
            const story = await fetchStoryByUrl(url);
            return res.json({
                type: story.type || "image",
                items: [{ id: 0, type: story.type || "image", thumbnail: story.thumbnail || story.url, mediaUrl: story.url, shortcode: null }],
                shortcode: null
            });
        }

        // 2. Profile
        if (url.match(/instagram\.com\/(?!p\/|reel\/|tv\/|stories\/)([a-zA-Z0-9_\.]+)/)) {
            const profile = await fetchProfileByUrl(url);
            return res.json({
                type: "image",
                items: [{ id: 0, type: "image", thumbnail: profile.thumbnail, mediaUrl: profile.url, shortcode: null, username: profile.username }],
                shortcode: null
            });
        }

        // 3. Regular Posts
        const match = url.match(/\/(reel|p|tv)\/([^/?]+)/);
        if (!match) return res.status(400).json({ error: "Invalid URL" });
        const shortcode = match[2];
        const media = await fetchMediaByShortcode(shortcode);

        if (media.carousel_media?.length > 0) {
            const items = media.carousel_media.map((item, idx) => {
                const isVideo = !!item.video_versions?.[0];
                return {
                    id: idx,
                    type: isVideo ? "video" : "image",
                    thumbnail: item.image_versions2?.candidates?.[0]?.url,
                    mediaUrl: isVideo ? item.video_versions[0].url : item.image_versions2.candidates[0].url,
                    shortcode
                };
            });
            return res.json({ type: "carousel", items, shortcode });
        }

        if (media.video_versions?.[0]) {
            return res.json({
                type: "video",
                items: [{ id: 0, type: "video", thumbnail: media.image_versions2?.candidates?.[0]?.url, mediaUrl: media.video_versions[0].url, shortcode }],
                shortcode
            });
        }

        if (media.image_versions2?.candidates?.[0]) {
            return res.json({
                type: "image",
                items: [{ id: 0, type: "image", thumbnail: media.image_versions2.candidates[0].url, mediaUrl: media.image_versions2.candidates[0].url, shortcode }],
                shortcode
            });
        }

        return res.status(404).json({ error: "Media not found" });
    } catch (err) {
        console.error("Preview error:", err);
        if (handleError) return handleError(err, res);
        res.status(500).json({ error: err.message || "Failed to fetch media" });
    }
});

app.get("/api/health", (req, res) => res.json({ status: "ok", version: "2.6" }));
app.get("/health", (req, res) => res.json({ status: "ok" }));
// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`✅ Backend running at http://localhost:${PORT}`);
});
