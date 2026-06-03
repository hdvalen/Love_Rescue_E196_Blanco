module.exports = {
    apps: [{
        name: 'adoptame-api',
        script: 'src/server.js',
        instances: 'max',
        exec_mode: 'cluster',
        env: {
            NODE_ENV: 'development',
            PORT: 3000
        },
        env_production: {
            NODE_ENV: 'production',
            PORT: 3000
        },
        max_memory_restart: '500M',
        error_file: './logs/pm2-error.log',
        out_file: './logs/pm2-out.log',
        merge_logs: true,
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        min_uptime: '10s',
        max_restarts: 5,
        restart_delay: 2000,
        kill_timeout: 5000,
        listen_timeout: 8000
    }]
};
