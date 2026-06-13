import { NextFunction, Request, Response } from 'express';
import { formatDateTime } from '../services/store';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    process.stdout.write(
      `[http] ${formatDateTime()} ${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms\n`
    );
  });
  next();
}
