import axios from 'axios';

// --- CONFIGURATION ---
const API_URL = 'http://localhost:3004/api/blog/publish';
const API_KEY = 'my_secret_key_123'; // CHANGE THIS to your BLOG_API_KEY from .env
// ---------------------

const testData = {
    title: "Success! The Blog is Live 🚀",
    content: "### Automation Complete\nThis post was generated via our custom test script. Your system is now ready for n8n to take over and start publishing SEO content automatically!",
    excerpt: "Verifying the automated publishing pipeline...",
    category: "Announcement",
    author: "InstamInsta AI",
    tags: ["live", "automation", "clean"]
};

async function runTest() {
    console.log('🚀 Sending test blog post to backend...');
    try {
        const response = await axios.post(API_URL, testData, {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY
            }
        });
        console.log('✅ SUCCESS! Post published.');
        console.log('Response:', response.data);
        console.log('\nCheck your site at: https://instaminsta.com/blog');
    } catch (error) {
        console.error('❌ FAILED to publish post.');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Error Details:', error.response.data);
            if (error.response.status === 401 || error.response.status === 403) {
                console.error('\nTIP: Your API Key might be wrong. Check your backend .env file!');
            }
        } else {
            console.error('Error Message:', error.message);
        }
    }
}

runTest();
