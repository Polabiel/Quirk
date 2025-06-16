module.exports = {
  apps: [
    {
      name: 'quirk-bot',
      script: 'dist/src/start.js',
      instances: 1,
      autorestart: true,
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'dist'],
      max_memory_restart: '1G',
      cron_restart: '0 * * * *',
      restart_delay: 2000,
      max_restarts: 50,
      min_uptime: '10s',
      exp_backoff_restart_delay: 100,
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      kill_timeout: 5000,
      listen_timeout: 3000,
      monitoring: false,
      pmx: false,
      node_args: '--max-old-space-size=1024',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};