import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import axios from "axios";
import * as resolverModule from "./resolver.js";
import * as igApi from "./igApi.js";

process.on('uncaughtException', (err) => {
    console.error('CRITICAL: Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
});

console.log("Starting Debug Server...");

try {
    const app = express();
    const PORT = 3004;

    app.use(cors());
    app.use(bodyParser.json());

    // Resolve function check
    const resolver = resolverModule.resolveUrl;
    console.log("Resolver function identified:", typeof resolver);

    app.post("/api/preview", async (req, res) => {
        console.log("📥 Received preview request:", req.body.url);
        try {
            const { url } = req.body;
            if (!url) return res.status(400).json({ error: "URL is required" });

            // Using the actual resolver or igApi directly for preview
            // For now, let's use the same logic as server.js

            // Handle stories separately
            if (url.includes("/stories/")) {
                const story = await igApi.fetchStoryByUrl(url);
                return res.json({
                    type: story.type,
                    items: [{ id: 0, type: story.type, thumbnail: story.thumbnail || story.url, mediaUrl: story.url, shortcode: null }],
                    shortcode: null
                });
            }

            const match = url.match(/\/(reel|p|tv)\/([^/?]+)/);
            if (!match) return res.status(400).json({ error: "Invalid Instagram URL" });
            const shortcode = match[2];

            const media = await igApi.fetchMediaByShortcode(shortcode);

            if (media.carousel_media && media.carousel_media.length > 0) {
                const items = media.carousel_media.map((item, idx) => ({
                    id: idx,
                    type: item.video_versions ? "video" : "image",
                    thumbnail: item.image_versions2?.candidates?.[0]?.url || item.video_versions?.[0]?.url,
                    mediaUrl: item.video_versions?.[0]?.url || item.image_versions2?.candidates?.[0]?.url,
                    shortcode
                }));
                return res.json({ type: "carousel", items, shortcode });
            }

            const type = media.video_versions ? "video" : "image";
            const thumb = media.image_versions2?.candidates?.[0]?.url;
            const mediaUrl = media.video_versions?.[0]?.url || thumb;

            return res.json({
                type,
                items: [{ id: 0, type, thumbnail: thumb, mediaUrl, shortcode }],
                shortcode
            });
        } catch (err) {
            console.error("❌ Preview error:", err.message);
            res.status(500).json({ error: err.message || "Failed to fetch media" });
        }
    });

    app.post("/api/download", async (req, res) => {
        console.log("📥 Received download request:", req.body.url);
        try {
            const { url, itemIndex } = req.body;
            await resolver(url, res, itemIndex);
        } catch (err) {
            console.error("❌ Download error:", err);
            if (!res.headersSent) res.status(500).json({ error: "Internal server error" });
        }
    });

    app.get("/", (req, res) => res.send("InstamInsta Backend Active"));

    app.listen(PORT, () => {
        console.log(`✅ Backend running at http://localhost:${PORT}`);
    });
} catch (err) {
    console.error("Failed to start server:", err);
}
