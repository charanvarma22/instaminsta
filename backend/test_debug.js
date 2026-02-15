import { fetchMediaByShortcode } from "./igApi.js";

async function runTest() {
    const shortcode = "DR_6TqqkbjV";
    console.log(`🚀 Starting diagnostic test for shortcode: ${shortcode}`);
    try {
        const result = await fetchMediaByShortcode(shortcode);
        console.log("✅ API Result Success!");
        console.log("Type:", result.media_type === 2 ? "video" : "image");
        console.log("Thumbnail URL:", result.image_versions2?.candidates?.[0]?.url.slice(0, 50) + "...");
        if (result.video_versions) {
            console.log("Video URL:", result.video_versions[0].url.slice(0, 50) + "...");
        }
    } catch (err) {
        console.error("❌ Diagnostic Test Failed!");
        console.error("Error Code:", err.code);
        console.error("Error Message:", err.message);
    }
}

runTest();
