import axios from 'axios';

async function test() {
    try {
        console.log("Sending request to http://localhost:3003/api/preview...");
        const res = await axios.post('http://localhost:3003/api/preview', {
            url: "https://www.instagram.com/reel/C3S7d8-M_67/"
        });
        console.log("Response:", JSON.stringify(res.data, null, 2));
    } catch (err) {
        console.error("Error:", err.response ? err.response.data : err.message);
    }
}

test();
