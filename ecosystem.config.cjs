module.exports = {
    apps: [
        {
            name: 'instaminsta-backend',
            script: 'server-debug.js',
            cwd: './backend',
            watch: false,
            env: {
                NODE_ENV: 'production',
                PORT: 3004
            }
        },
        {
            name: 'instaminsta-frontend',
            script: 'node_modules/vite/bin/vite.js',
            args: '--port 3005 --host',
            watch: false,
            env: {
                NODE_ENV: 'production'
            }
        }
    ]
};
