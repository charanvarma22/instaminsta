import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadCookies() {
    try {
        const cookiePath = path.join(__dirname, "cookies.txt");
        if (!fs.existsSync(cookiePath)) {
            console.warn("⚠️ cookies.txt not found at", cookiePath);
            return "";
        }
        const lines = fs.readFileSync(cookiePath, "utf8").split(/\r?\n/);
        const cookies = [];

        for (let line of lines) {
            line = line.trim();
            if (!line) continue;
            if (line.startsWith("# Netscape")) continue;
            if (line.startsWith("# http")) continue;

            // Remove #HttpOnly_ prefix safely
            if (line.startsWith("#HttpOnly_")) {
                line = line.replace("#HttpOnly_", "");
            }

            const parts = line.split("\t");
            if (parts.length < 7) continue;

            const name = parts[5];
            const value = parts[6];

            if (name && value) {
                cookies.push(`${name}=${value}`);
            }
        }

        return cookies.join("; ");
    } catch (err) {
        console.error("❌ Error loading cookies:", err.message);
        return "";
    }
}

const COOKIE = loadCookies();
const csrfMatch = COOKIE.match(/csrftoken=([^;]+)/);
const CSRF_TOKEN = csrfMatch ? csrfMatch[1] : "";

const mobileHeaders = {
    "User-Agent":
        "Instagram 269.0.0.18.75 Android (30/11; 420dpi; 1080x2340; samsung; SM-G991B; o1s; exynos2100; en_US)",
    "X-IG-App-ID": "936619743392459",
    "Cookie": COOKIE,
    "Accept": "*/*",
    "X-CSRFToken": CSRF_TOKEN
};

const webHeaders = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Cookie": COOKIE,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Dest": "document",
    "Upgrade-Insecure-Requests": "1"
};

// 0️⃣ Algorithmic Shortcode -> Media ID
function getMediaId(shortcode) {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    let id = 0n;
    for (let i = 0; i < shortcode.length; i++) {
        const char = shortcode[i];
        const index = alphabet.indexOf(char);
        id = id * 64n + BigInt(index);
    }
    return id.toString();
}

// Helper for retrying requests with exponential backoff
async function withRetry(fn, maxRetries = 3, initialDelay = 1000) {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (err) {
            lastError = err;
            const status = err.response?.status;

            // Don't retry on 404 (Not Found) or 400 (Bad Request)
            if (status === 404 || status === 400) throw err;

            // Only retry on rate limits (429) or server errors (5xx) or timeouts
            if (status === 429 || (status >= 500 && status <= 599) || err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
                const delay = initialDelay * Math.pow(2, i);
                console.warn(`⚠️ Request failed (Status: ${status || err.code}). Retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            throw err;
        }
    }
    throw lastError;
}

export async function fetchMediaByShortcode(shortcode) {
    try {
        const mediaId = getMediaId(shortcode);
        const apiUrl = `https://i.instagram.com/api/v1/media/${mediaId}/info/`;

        const res = await withRetry(() =>
            axios.get(apiUrl, { headers: mobileHeaders, timeout: 15000 })
        );

        if (!res.data?.items?.[0]) {
            throw new Error("API_BLOCKED");
        }

        return res.data.items[0];
    } catch (err) {
        if (err.message === "MEDIA_NOT_FOUND") {
            throw { code: "MEDIA_NOT_FOUND", message: "This post might be deleted, private, or archived" };
        }
        if (err.message === "API_BLOCKED") {
            throw { code: "API_BLOCKED", message: "Instagram API blocked - try again later or check cookies" };
        }
        const status = err.response?.status;
        if (status === 404) {
            throw { code: "NOT_FOUND", message: "Post not found or has been deleted" };
        }
        if (status === 429) {
            throw { code: "RATE_LIMIT", message: "Instagram rate limit reached - try again later" };
        }
        if (err.code === "ECONNREFUSED" || err.code === "ECONNABORTED") {
            throw { code: "NETWORK", message: "Network error or timeout - check your connection" };
        }
        throw { code: "UNKNOWN", message: err.message || "Failed to fetch media" };
    }
}

// Best-effort fetch for stories given a full story URL (e.g. /stories/<username>/<id>/)
export async function fetchStoryByUrl(storyUrl) {
    // Try to call the Instagram mobile API first if we can extract a numeric media id
    try {
        const idMatch = storyUrl.match(/stories\/[^\/]+\/(\d+)/);
        if (idMatch) {
            const mediaId = idMatch[1];
            try {
                const apiUrl = `https://i.instagram.com/api/v1/media/${mediaId}/info/`;
                const res = await withRetry(() =>
                    axios.get(apiUrl, { headers: mobileHeaders, timeout: 15000 })
                );
                const item = res.data?.items?.[0];
                if (item) {
                    if (item.video_versions && item.video_versions.length > 0) {
                        const videoUrl = item.video_versions[0].url;
                        const thumbnail = item.image_versions2?.candidates?.[0]?.url || null;
                        return { type: "video", url: videoUrl, thumbnail };
                    }
                    if (item.image_versions2 && item.image_versions2.candidates?.length > 0) {
                        const imgUrl = item.image_versions2.candidates[0].url;
                        return { type: "image", url: imgUrl, thumbnail: imgUrl };
                    }
                }
            } catch (apiErr) {
                // fall through to HTML scraping if mobile API fails
                console.warn("mobile API story fetch failed:", apiErr.message);
            }
        }

        // Fallback: fetch the public story page HTML and try to extract urls
        const html = await axios.get(storyUrl, { headers: webHeaders, timeout: 10000 });
        const data = html.data || "";

        // try several regexes for video URL
        const videoMatch = data.match(/"video_versions"\s*:\s*\[\s*\{[^\}]*"url"\s*:\s*"([^"]+)"/i);
        if (videoMatch) {
            const videoUrl = videoMatch[1].replace(/\\u0026/g, "&");
            // Try to extract thumbnail from display_url
            const thumbMatch = data.match(/"display_url"\s*:\s*"([^"]+)"/i) || data.match(/"image_versions2"[^}]*"candidates"[^\]]*\{[^}]*"url"\s*:\s*"([^"]+)"/i);
            const thumbnail = thumbMatch ? thumbMatch[1].replace(/\\u0026/g, "&") : null;
            return { type: "video", url: videoUrl, thumbnail };
        }

        // try for a single video_url field
        const videoMatch2 = data.match(/"video_url"\s*:\s*"([^\"]+)"/i);
        if (videoMatch2) {
            const videoUrl = videoMatch2[1].replace(/\\u0026/g, "&");
            const thumbMatch = data.match(/"display_url"\s*:\s*"([^"]+)"/i) || data.match(/"image_versions2"[^}]*"candidates"[^\]]*\{[^}]*"url"\s*:\s*"([^"]+)"/i);
            const thumbnail = thumbMatch ? thumbMatch[1].replace(/\\u0026/g, "&") : null;
            return { type: "video", url: videoUrl, thumbnail };
        }

        // try image/display URL
        const imgMatch = data.match(/"display_url"\s*:\s*"([^\"]+)"/i) || data.match(/"display_src"\s*:\s*"([^\"]+)"/i);
        if (imgMatch) {
            const imgUrl = imgMatch[1].replace(/\\u0026/g, "&");
            return { type: "image", url: imgUrl, thumbnail: imgUrl };
        }

        throw new Error("STORY_NOT_FOUND");
    } catch (err) {
        if (err.message === "STORY_NOT_FOUND" || err.code === "STORY_NOT_FOUND") {
            throw { code: "STORY_NOT_FOUND", message: "Story expired or has been deleted" };
        }
        if (err.response?.status === 404) {
            throw { code: "NOT_FOUND", message: "Story not found" };
        }
        throw { code: "UNKNOWN", message: "Failed to fetch story media" };
    }
}

// Profile Photo Downloader
export async function fetchProfileByUrl(profileUrl) {
    try {
        // Extract username
        // Matches: instagram.com/username/ or instagram.com/username
        // Excludes: instagram.com/p/, /reel/, /stories/
        const usernameMatch = profileUrl.match(/instagram\.com\/(?!p\/|reel\/|tv\/|stories\/)([a-zA-Z0-9_\.]+)/);
        if (!usernameMatch) {
            throw new Error("INVALID_URL");
        }

        const username = usernameMatch[1];
        console.log(`🔍 Fetching profile for: ${username}`);

        // Try 1: Web Profile Info API (Needs strict headers)
        try {
            const apiUrl = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`;
            const res = await withRetry(() =>
                axios.get(apiUrl, {
                    headers: {
                        ...webHeaders,
                        "X-IG-App-ID": "936619743392459",
                        "X-Requested-With": "XMLHttpRequest",
                        "Referer": `https://www.instagram.com/${username}/`
                    },
                    timeout: 10000
                })
            );

            const user = res.data?.data?.user;
            if (user) {
                const hdUrl = user.profile_pic_url_hd || user.profile_pic_url;
                return {
                    type: "image",
                    url: hdUrl,
                    thumbnail: user.profile_pic_url,
                    username: user.username,
                    is_private: user.is_private
                };
            }
        } catch (apiErr) {
            console.warn("⚠️ Web profile API failed, falling back to HTML scraping:", apiErr.message);
        }

        // Try 2: Scraping HTML (Fallback)
        const htmlRes = await axios.get(`https://www.instagram.com/${username}/`, {
            headers: webHeaders,
            timeout: 10000
        });

        const html = htmlRes.data;

        // Try to find HD URL in meta tags or sharedData
        // og:image is usually 150x150 or 320x320, but better than nothing
        const metaMatch = html.match(/<meta property="og:image" content="([^"]+)"/i);
        if (metaMatch) {
            const imgUrl = metaMatch[1].replace(/\\u0026/g, "&");
            return {
                type: "image",
                url: imgUrl,
                thumbnail: imgUrl,
                username: username
            };
        }

        throw new Error("PROFILE_NOT_FOUND");
    } catch (err) {
        if (err.message === "INVALID_URL") {
            throw { code: "INVALID_URL", message: "Invalid Profile URL format" };
        }
        if (err.message === "PROFILE_NOT_FOUND") {
            throw { code: "NOT_FOUND", message: "User not found" };
        }
        throw { code: "UNKNOWN", message: "Failed to fetch profile photo" };
    }
}

// IGTV Video Downloader
export async function fetchIGTVByUrl(igtvUrl) {
    try {
        // Extract shortcode from URL
        const shortcodeMatch = igtvUrl.match(/\/tv\/([^/?]+)/);
        if (!shortcodeMatch) {
            throw new Error("INVALID_URL");
        }

        const shortcode = shortcodeMatch[1];
        const media = await fetchMediaByShortcode(shortcode);

        // IGTV content should have video_versions
        if (!media.video_versions || media.video_versions.length === 0) {
            throw new Error("NO_VIDEO");
        }

        const videoUrl = media.video_versions[0].url;
        const caption = media.caption?.text || "igtv";

        return {
            type: "video",
            url: videoUrl,
            title: caption.substring(0, 50) // First 50 chars as filename hint
        };
    } catch (err) {
        if (err.message === "INVALID_URL") {
            throw { code: "INVALID_URL", message: "Invalid IGTV URL format" };
        }
        if (err.message === "NO_VIDEO") {
            throw { code: "NO_VIDEO", message: "IGTV video not found - it might be private or deleted" };
        }
        throw err; // re-throw other errors for proper handling
    }
}
