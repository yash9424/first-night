module.exports = {
  apps: [{
    name: 'technovatechnologies-api',
    script: 'server/server.js',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/pm2/error.log',
    out_file: '/var/log/pm2/out.log',
    time: true,
    node_args: '--max-old-space-size=384'
  }]
};  