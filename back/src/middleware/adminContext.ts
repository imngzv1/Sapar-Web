import { NextFunction, Request, Response } from 'express';
import { config } from '../config';

function decodeHeader(raw: string | undefined): string | null {
  if (!raw) return null;
  // HTTP-заголовки приходят как latin1, фронт шлёт UTF-8 — перекодируем
  try {
    return Buffer.from(raw, 'latin1').toString('utf8');
  } catch {
    return raw;
  }
}

export function adminContext(req: Request, _res: Response, next: NextFunction): void {
  req.adminName = decodeHeader(req.header('X-Admin-Name')) || config.defaultAdminName;
  next();
}
