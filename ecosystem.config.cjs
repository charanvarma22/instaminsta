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
            script: 'vps-server.js',
            watch: false,
            env: {
                NODE_ENV: 'production'
            }
        }
    ]
};
