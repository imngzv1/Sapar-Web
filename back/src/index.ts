import express from 'express';
import cors from 'cors';

import { config } from './config';
import api from './routes';
import { adminContext } from './middleware/adminContext';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { ensureLogsDir } from './services/audit';
import { startRotator, stopRotator } from './services/logRotator';

const app = express();

app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(requestLogger);
app.use(adminContext);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api', api);

app.use((_req, res) => {
  res.status(404).json({ error: 'Не найдено' });
});

app.use(errorHandler);

ensureLogsDir();
startRotator();

const server = app.listen(config.port, config.host, () => {
  console.log(`[server] Попутка API запущен на http://${config.host}:${config.port}`);
  console.log(`[server] CORS разрешён для: ${config.corsOrigin}`);
  console.log(`[server] Папка логов: ${config.logsDir} (хранение ${config.logRetentionDays} дн.)`);
});

function shutdown(signal: NodeJS.Signals): void {
  console.log(`[server] получен ${signal}, останавливаюсь`);
  stopRotator();
  server.close(() => process.exit(0));
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
