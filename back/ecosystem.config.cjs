/*
  PM2-конфиг.
  Запуск:   pm2 start ecosystem.config.cjs
  Логи:     pm2 logs poputka-admin-back
*/

const path = require('path');

const LOGS_DIR = path.resolve(__dirname, '..', 'logs');

module.exports = {
  apps: [
    {
      name: 'poputka-admin-back',
      script: 'src/index.ts',
      interpreter: './node_modules/.bin/tsx',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',

      env: { NODE_ENV: 'development' },
      env_production: { NODE_ENV: 'production' },

      out_file: path.join(LOGS_DIR, 'pm2-out.log'),
      error_file: path.join(LOGS_DIR, 'pm2-error.log'),
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
