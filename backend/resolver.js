import axios from "axios";
import { fetchMediaByShortcode, fetchStoryByUrl, fetchIGTVByUrl } from "./igApi.js";
import { streamZip } from "./streamZip.js";

export async function resolveUrl(url, res, itemIndex) {
    try {
        if (url.includes("/reel/")) return await handleReel(url, res);
        if (url.includes("/p/")) return await handlePost(url, res, itemIndex);
        if (url.includes("/tv/")) return await handleIGTV(url, res);
        if (url.includes("/stories/")) return await handleStory(url, res);

        return res.status(400).json({ error: "Unsupported URL type" });
    } catch (err) {
        return handleError(err, res);
    }
}

async function handleStory(url, res) {
    try {
        const story = await fetchStoryByUrl(url);

        if (story.type === "video" || story.video_url) {
            res.setHeader("Content-Type", "video/mp4");
            res.setHeader("Content-Disposition", "attachment; filename=story.mp4");

            const videoUrl = story.url || story.video_url;
            const stream = await axios.get(videoUrl, { responseType: "stream" });
            return stream.data.on('error', (err) => {
                console.error("Stream error:", err);
                if (!res.headersSent) res.status(500).send("Stream error");
            }).pipe(res);
        }

        if (story.type === "image" || story.display_url) {
            res.setHeader("Content-Type", "image/jpeg");
            res.setHeader("Content-Disposition", "attachment; filename=story.jpg");

            const imgUrl = story.url || story.display_url;
            const stream = await axios.get(imgUrl, { responseType: "stream" });
            return stream.data.on('error', (err) => {
                console.error("Stream error:", err);
                if (!res.headersSent) res.status(500).send("Stream error");
            }).pipe(res);
        }

        return res.status(400).json({ error: "Unsupported story media type" });
    } catch (err) {
        return handleError(err, res);
    }
}

function extractShortcode(url) {
    const m = url.match(/\/(reel|p|tv)\/([^/?]+)/);
    if (!m) throw new Error("Invalid Instagram URL");
    return m[2];
}

async function handleReel(url, res) {
    const shortcode = extractShortcode(url);
    const media = await fetchMediaByShortcode(shortcode);

    const videoUrl = media.video_versions?.[0]?.url || media.video_url;
    if (!videoUrl) throw new Error("Reel video not found");

    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Disposition", "attachment; filename=reel.mp4");

    const stream = await axios.get(videoUrl, { responseType: "stream" });
    stream.data.on('error', (err) => {
        console.error("Stream error:", err);
        if (!res.headersSent) res.status(500).send("Stream error");
    }).pipe(res);
}

async function handleIGTV(url, res) {
    try {
        const igtv = await fetchIGTVByUrl(url);

        res.setHeader("Content-Type", "video/mp4");
        res.setHeader("Content-Disposition", `attachment; filename=igtv_${igtv.title.slice(0, 30)}.mp4`);

        const stream = await axios.get(igtv.url, { responseType: "stream" });
        return stream.data.on('error', (err) => {
            console.error("Stream error:", err);
            if (!res.headersSent) res.status(500).send("Stream error");
        }).pipe(res);
    } catch (err) {
        return handleError(err, res);
    }
}

/* ================= POSTS ================= */

async function handlePost(url, res, itemIndex) {
    const shortcode = extractShortcode(url);
    const media = await fetchMediaByShortcode(shortcode);

    if (media.carousel_media) {
        if (itemIndex !== undefined && itemIndex !== null) {
            const item = media.carousel_media[itemIndex];
            if (!item) throw new Error("Carousel item not found");
            return streamSingle(item, res);
        }
        return streamZip(media.carousel_media, res);
    }

    return streamSingle(media, res);
}

async function streamSingle(media, res) {
    /* VIDEO POST */
    const videoUrl = media.video_versions?.[0]?.url || media.video_url;
    if (videoUrl) {
        res.setHeader("Content-Type", "video/mp4");
        res.setHeader("Content-Disposition", "attachment; filename=video.mp4");

        const stream = await axios.get(videoUrl, { responseType: "stream" });
        return stream.data.on('error', (err) => {
            console.error("Stream error:", err);
            if (!res.headersSent) res.status(500).send("Stream error");
        }).pipe(res);
    }

    /* IMAGE POST */
    const imgUrl = media.image_versions2?.candidates?.[0]?.url || media.display_url;
    if (imgUrl) {
        res.setHeader("Content-Type", "image/jpeg");
        res.setHeader("Content-Disposition", "attachment; filename=image.jpg");

        const stream = await axios.get(imgUrl, { responseType: "stream" });
        return stream.data.on('error', (err) => {
            console.error("Stream error:", err);
            if (!res.headersSent) res.status(500).send("Stream error");
        }).pipe(res);
    }

    throw new Error("Unknown post type");
}

// Error handler with user-friendly messages
export function handleError(err, res) {
    const errorMap = {
        "MEDIA_NOT_FOUND": { status: 404, message: "Post not found - it might be deleted or private" },
        "STORY_NOT_FOUND": { status: 404, message: "Story expired or deleted (stories disappear after 24h)" },
        "API_BLOCKED": { status: 429, message: "All Instagram sessions are temporarily blocked or invalid" },
        "NO_COOKIES": { status: 503, message: "No Instagram cookies found. Please add cookies to backend/cookies/ folder." },
        "NOT_FOUND": { status: 404, message: "Content not found" },
        "NO_VIDEO": { status: 400, message: "Video not found in this IGTV" },
        "INVALID_URL": { status: 400, message: "Invalid Instagram URL format" },
        "NETWORK": { status: 503, message: "Network error - please check your connection" },
        "UNKNOWN": { status: 500, message: "Unknown error occurred - please try another link" }
    };

    const errorCode = err.code || "UNKNOWN";
    const errorInfo = errorMap[errorCode] || { status: 500, message: err.message || "Server error" };

    return res.status(errorInfo.status).json({
        error: errorInfo.message,
        code: errorCode,
        timestamp: new Date().toISOString()
    });
}
