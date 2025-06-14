module.exports = {
  apps: [
    {
      name: 'quirk-bot',
      script: 'dist/src/start.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      cron_restart: '0 * * * *',
      restart_delay: 2000,
      max_restarts: 50,
      min_uptime: '10s',
      exp_backoff_restart_delay: 100,
      max_memory_restart: '1G',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      kill_timeout: 5000,
      listen_timeout: 3000,
      monitoring: true,
      pmx: true,
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};