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
      restart_delay: 1000,
      max_restarts: 24,
      min_uptime: '10s',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};