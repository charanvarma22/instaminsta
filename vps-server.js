const express = require('express');
const path = require('path');
const app = express();
const port = 3005;

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'dist')));

// Serve index.html for all routes (for React Router)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Production Frontend running at http://0.0.0.0:${port}`);
});
