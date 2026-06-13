import 'dotenv/config';
import path from 'path';

export const config = {
  port: Number(process.env.PORT) || 4000,
  host: process.env.HOST || '0.0.0.0',

  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

  defaultAdminName: process.env.DEFAULT_ADMIN_NAME || 'Админ Данияр',

  logsDir: path.resolve(__dirname, '..', process.env.LOGS_DIR || '../logs'),
  logRetentionDays: Number(process.env.LOG_RETENTION_DAYS) || 30,

  seedDir: path.resolve(__dirname, 'db', 'seed'),
  uploadsDir: path.resolve(__dirname, '..', 'uploads'),

  db: {
    host: process.env.DB_HOST ?? null,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : null,
    name: process.env.DB_NAME ?? null,
    user: process.env.DB_USER ?? null,
    password: process.env.DB_PASSWORD ?? null,
  },
};
