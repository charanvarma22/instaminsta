module.exports = {
    apps: [
        {
            name: 'instaminsta-backend',
            script: 'server.js',
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
