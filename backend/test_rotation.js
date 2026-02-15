import { fetchMediaByShortcode } from "./igApi.js";

async function testRotation() {
    console.log("🚀 Testing Cookie Rotation...");
    const testShortcode = "C-yv8cNSv2M"; // Example public post

    try {
        const data = await fetchMediaByShortcode(testShortcode);
        console.log("✅ Successfully fetched media!");
        console.log("Media ID:", data.id);
    } catch (err) {
        console.error("❌ Test failed:", err.message);
        if (err.code) console.error("Error Code:", err.code);
    }
}

testRotation();
