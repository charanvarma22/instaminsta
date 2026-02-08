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
            script: 'serve',
            args: '-s dist -l 3005',
            watch: false,
            env: {
                NODE_ENV: 'production'
            }
        }
    ]
};
