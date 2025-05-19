module.exports = {
  apps: [{
    name: 'technovatechnologies-api',
    script: 'server/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '768M',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/pm2/error.log',
    out_file: '/var/log/pm2/out.log',
    time: true,
    node_args: '--max-old-space-size=512',
    exp_backoff_restart_delay: 100,
    max_restarts: 10,
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};  