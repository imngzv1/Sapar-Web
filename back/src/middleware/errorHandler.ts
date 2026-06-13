import { NextFunction, Request, Response } from 'express';
import { formatDateTime } from '../services/store';

interface HttpError extends Error {
  status?: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: HttpError, req: Request, res: Response, _next: NextFunction): void {
  process.stderr.write(
    `[error] ${formatDateTime()} ${req.method} ${req.originalUrl} — ${err.message}\n${err.stack ?? ''}\n`
  );
  res.status(err.status || 500).json({
    error: err.message || 'Внутренняя ошибка сервера',
  });
}
