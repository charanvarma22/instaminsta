import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CookieManager {
    constructor() {
        this.sessions = [];
        this.currentIndex = 0;
        this.loadSessions();
    }

    loadSessions() {
        try {
            const cookiesDir = path.join(__dirname, "cookies");
            if (!fs.existsSync(cookiesDir)) {
                fs.mkdirSync(cookiesDir, { recursive: true });
                console.warn("⚠️ cookies directory created at", cookiesDir);
            }

            const files = fs.readdirSync(cookiesDir).filter(f => f.endsWith(".txt"));
            this.sessions = [];

            for (const file of files) {
                const filePath = path.join(cookiesDir, file);
                const cookieString = this.parseNetscapeCookies(filePath);
                if (cookieString) {
                    const csrfMatch = cookieString.match(/csrftoken=([^;]+)/);
                    this.sessions.push({
                        id: file,
                        cookie: cookieString,
                        csrf: csrfMatch ? csrfMatch[1] : "",
                        fails: 0
                    });
                }
            }

            if (this.sessions.length > 0) {
                console.log(`✅ Loaded ${this.sessions.length} Instagram sessions`);
            } else {
                console.warn("⚠️ No cookies found in backend/cookies/ - requests will likely fail.");
            }
        } catch (err) {
            console.error("❌ Error loading sessions:", err.message);
        }
    }

    parseNetscapeCookies(filePath) {
        try {
            const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
            const cookies = [];
            for (let line of lines) {
                line = line.trim();
                if (!line || line.startsWith("# ")) continue;
                if (line.startsWith("#HttpOnly_")) line = line.replace("#HttpOnly_", "");

                const parts = line.split("\t");
                if (parts.length < 7) continue;

                const name = parts[5];
                const value = parts[6];
                if (name && value) cookies.push(`${name}=${value}`);
            }
            return cookies.join("; ");
        } catch (err) {
            return null;
        }
    }

    getNextSession() {
        if (this.sessions.length === 0) return null;
        const session = this.sessions[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.sessions.length;
        return session;
    }

    getHeaders(session) {
        if (!session) return null;
        return {
            mobile: {
                "User-Agent": "Instagram 269.0.0.18.75 Android (30/11; 420dpi; 1080x2340; samsung; SM-G991B; o1s; exynos2100; en_US)",
                "X-IG-App-ID": "936619743392459",
                "Cookie": session.cookie,
                "Accept": "*/*",
                "X-CSRFToken": session.csrf
            },
            web: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
                "Cookie": session.cookie,
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
                "Sec-Fetch-Mode": "navigate",
                "Sec-Fetch-Dest": "document",
                "Upgrade-Insecure-Requests": "1"
            }
        };
    }
}

const cookieMgr = new CookieManager();

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

// Helper for retrying requests with session rotation
async function withSessionRetry(fn, maxRetries = 3) {
    let lastError;
    // We try up to sessions.length or maxRetries, whichever is higher
    const attempts = Math.max(maxRetries, cookieMgr.sessions.length);

    for (let i = 0; i < attempts; i++) {
        const session = cookieMgr.getNextSession();
        if (!session) {
            throw { code: "NO_COOKIES", message: "No Instagram cookies available" };
        }

        const headers = cookieMgr.getHeaders(session);

        try {
            return await fn(headers);
        } catch (err) {
            lastError = err;
            const status = err.response?.status;

            // Don't retry on 404 (Not Found)
            if (status === 404) throw err;

            // If it's a cookie issue (400, 401, 403) or rate limit (429), we rotate and try again immediately
            if (status === 400 || status === 401 || status === 403 || status === 429) {
                console.warn(`⚠️ Session ${session.id} failed (Status: ${status}). Rotating... (Attempt ${i + 1}/${attempts})`);
                continue;
            }

            // For other errors (5xx, timeouts), we wait a bit before retrying with next session
            if ((status >= 500 && status <= 599) || err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
                const delay = 1000 * Math.pow(2, i % 3);
                console.warn(`⚠️ Request failed (${status || err.code}). Retrying in ${delay}ms with next session...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            throw err;
        }
    }
    throw lastError;
}

export function selectBestVideo(media) {
    if (!media || !media.video_versions) return null;

    const candidates = media.video_versions;

    // 🏆 Strategy 1: Look for combined MP4s (Type 1)
    // These usually have audio and video baked in.
    const combined = candidates.filter(v => v.type === 1);
    if (combined.length > 0) {
        // Return the highest resolution among the combined ones
        return combined.sort((a, b) => (b.width * b.height) - (a.width * a.height))[0].url;
    }

    // 🥈 Strategy 2: If no Type 1, look for Type 101/102 (DASH)
    // Note: Type 101 is usually Video Only, 102 is Audio Only.
    // If we only have these, we'll need to flag them later for merging.
    // For now, let's pick the highest resolution one that isn't explicitly silent if possible.
    const nonDASH = candidates.filter(v => v.type !== 101);
    if (nonDASH.length > 0) {
        return nonDASH.sort((a, b) => (b.width * b.height) - (a.width * a.height))[0].url;
    }

    // Final fallback: Highest resolution possible
    return candidates.sort((a, b) => (b.width * b.height) - (a.width * a.height))[0].url;
}

export async function fetchMediaByShortcode(shortcode) {
    try {
        const mediaId = getMediaId(shortcode);
        const apiUrl = `https://i.instagram.com/api/v1/media/${mediaId}/info/`;

        console.log(`📡 Fetching Media Info: ${shortcode} (ID: ${mediaId})`);

        let item;
        try {
            const res = await withSessionRetry((headers) =>
                axios.get(apiUrl, { headers: headers.mobile, timeout: 15000 })
            );

            if (res.data?.items?.[0]) {
                item = res.data.items[0];
                item.source = "mobile";

                // If the mobile result doesn't have a combined MP4 (type 1), 
                // it might be a silent DASH stream. We'll flag it for fallback.
                const hasCombined = item.video_versions?.some(v => v.type === 1);
                if (!hasCombined && item.video_versions?.length > 0) {
                    console.log("⚠️ Mobile API returned potentially silent DASH stream. Will try Web API fallback for audio...");
                } else {
                    item.best_video_url = selectBestVideo(item);
                    return item;
                }
            }
        } catch (mobileErr) {
            console.error(`❌ Mobile API Failed: ${mobileErr.message}`);
        }

        // Proactive Fallback to Web API for better audio reliability
        console.log(`🔄 Attempting Web API for: ${shortcode}...`);
        try {
            const webApiUrl = `https://www.instagram.com/p/${shortcode}/?__a=1&__d=dis`;
            const webRes = await withSessionRetry((headers) =>
                axios.get(webApiUrl, { headers: headers.web, timeout: 10000 })
            );

            const webItem = webRes.data?.items?.[0] || webRes.data?.graphql?.shortcode_media;
            if (webItem) {
                console.log("✅ Web API Success!");
                webItem.source = "web";
                webItem.best_video_url = selectBestVideo(webItem) || webItem.video_url;

                // Merge info if we had a partial mobile result
                if (item) {
                    return { ...item, ...webItem, best_video_url: webItem.best_video_url || item.best_video_url };
                }
                return webItem;
            }
        } catch (webErr) {
            console.error("❌ Web API failed:", webErr.message);
        }

        if (item) {
            item.best_video_url = selectBestVideo(item);
            return item;
        }

        throw { code: "UNKNOWN", message: "Failed to fetch media from all sources" };
    } catch (err) {
        const status = err.response?.status;
        const body = err.response?.data;

        console.error(`❌ Mobile API Fetch Failed | Status: ${status} | Message: ${err.message}`);
        if (body) console.error(`❌ Response Body:`, JSON.stringify(body).slice(0, 300));

        // Fallback to Web API if mobile fails
        if (status !== 404) {
            console.log(`🔄 Attempting Web API Fallback for: ${shortcode}...`);
            try {
                const webApiUrl = `https://www.instagram.com/p/${shortcode}/?__a=1&__d=dis`;
                const webRes = await withSessionRetry((headers) =>
                    axios.get(webApiUrl, { headers: headers.web, timeout: 10000 })
                );
                const item = webRes.data?.items?.[0] || webRes.data?.graphql?.shortcode_media;
                if (item) {
                    console.log("✅ Web API Success!");
                    return item;
                }
            } catch (webErr) {
                console.error("❌ Web API Fallback failed:", webErr.message);
                if (webErr.response?.data) console.error("❌ Web API Body:", JSON.stringify(webErr.response.data).slice(0, 200));
            }
        }

        if (err.message === "API_BLOCKED") {
            throw { code: "API_BLOCKED", message: "Instagram API blocked - check cookies" };
        }
        if (status === 404) {
            throw { code: "NOT_FOUND", message: "Post not found or has been deleted" };
        }
        if (status === 429) {
            throw { code: "RATE_LIMIT", message: "Instagram rate limit reached" };
        }
        if (status === 400) {
            throw { code: "UNKNOWN", message: `Instagram rejected the request (400). Cookies might be invalid.` };
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
                const res = await withSessionRetry((headers) =>
                    axios.get(apiUrl, { headers: headers.mobile, timeout: 15000 })
                );
                const item = res.data?.items?.[0];
                if (item) {
                    const videoUrl = selectBestVideo(item);
                    if (videoUrl) {
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
        const html = await withSessionRetry((headers) =>
            axios.get(storyUrl, { headers: headers.web, timeout: 10000 })
        );
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
            const res = await withSessionRetry((headers) =>
                axios.get(apiUrl, {
                    headers: {
                        ...headers.web,
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
        const htmlRes = await withSessionRetry((headers) =>
            axios.get(`https://www.instagram.com/${username}/`, {
                headers: headers.web,
                timeout: 10000
            })
        );

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
