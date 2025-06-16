module.exports = {
  apps: [
    {
      name: 'quirk-bot',
      script: 'dist/src/start.js',
      instances: 1,
      autorestart: true,
      watch: false,
      ignore_watch: ['node_modules', 'logs', '.git', 'dist'],
      max_memory_restart: '1G',
      cron_restart: '0 2 * * *', // Restart diário às 2h da manhã
      restart_delay: 2000,
      max_restarts: 10,
      min_uptime: '30s',
      exp_backoff_restart_delay: 100,
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      time: true,
      kill_timeout: 10000,
      listen_timeout: 5000,
      wait_ready: true,
      node_args: '--max-old-space-size=1024 --enable-source-maps',
      // Configurações específicas para capturar logs do pino
      log_type: 'json',
      combine_logs: true,
      force: true,
      env: {
        NODE_ENV: 'development',
        TZ: 'America/Sao_Paulo',
        // Força pino a usar formato JSON para PM2
        PINO_LOG_LEVEL: 'debug',
        FORCE_COLOR: '0'
      },
      env_production: {
        NODE_ENV: 'production',
        TZ: 'America/Sao_Paulo',
        // Em produção, usa formato simples para PM2
        PINO_LOG_LEVEL: 'info',
        FORCE_COLOR: '0'
      },
    },
  ],
  deploy: {
    production: {
      user: 'root',
      host: ['localhost'],
      ref: 'origin/main',
      repo: 'git@github.com:your-repo/quirk-bot.git',
      path: '/var/www/quirk-bot',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'apt update && apt install git -y'
    }
  }
};