module.exports = {
  apps: [{
    name: "technovatechnologies-api",
    cwd: "./server",
    script: "app.js",
    watch: false,
    instances: 1,
    autorestart: true,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production",
      PORT: 5000
    },
    error_file: "/var/log/pm2/error.log",
    out_file: "/var/log/pm2/out.log",
    log_file: "/var/log/pm2/combined.log",
    time: true
  }]
};  