/*
  Чистит логи старше config.logRetentionDays.
  - файлы admin-actions-YYYY-MM-DD.log удаляются;
  - записи из journal со старыми датами переносятся в logs/archive.log и убираются из активного.
*/

import fs from 'fs';
import path from 'path';

import { config } from '../config';
import { auditStore } from './audit';
import { AdminLog } from '../types';

const DAY_MS = 24 * 60 * 60 * 1000;

function ensureDir(): void {
  if (!fs.existsSync(config.logsDir)) {
    fs.mkdirSync(config.logsDir, { recursive: true });
  }
}

function parseLogDate(raw: string | undefined): Date | null {
  if (!raw) return null;
  const [datePart, timePart = '00:00'] = raw.split(' ');
  const [dd, mm, yyyy] = datePart.split('.');
  const [hh, min] = timePart.split(':');
  const d = new Date(
    Number(yyyy),
    Number(mm) - 1,
    Number(dd),
    Number(hh) || 0,
    Number(min) || 0
  );
  return Number.isNaN(d.getTime()) ? null : d;
}

function cleanFiles(): number {
  ensureDir();
  const cutoff = Date.now() - config.logRetentionDays * DAY_MS;
  let deleted = 0;
  for (const name of fs.readdirSync(config.logsDir)) {
    if (!name.startsWith('admin-actions-')) continue;
    const fullPath = path.join(config.logsDir, name);
    try {
      if (fs.statSync(fullPath).mtimeMs < cutoff) {
        fs.unlinkSync(fullPath);
        deleted += 1;
      }
    } catch (err) {
      console.error(`[rotator] не удалось обработать ${name}: ${(err as Error).message}`);
    }
  }
  return deleted;
}

function cleanStore(): number {
  const cutoff = Date.now() - config.logRetentionDays * DAY_MS;
  const kept: AdminLog[] = [];
  const expired: AdminLog[] = [];
  for (const log of auditStore.list()) {
    const d = parseLogDate(log.date);
    if (d && d.getTime() < cutoff) expired.push(log);
    else kept.push(log);
  }

  if (expired.length > 0) {
    ensureDir();
    const archivePath = path.join(config.logsDir, 'archive.log');
    const lines = expired.map((e) => JSON.stringify(e)).join('\n') + '\n';
    fs.appendFileSync(archivePath, lines, 'utf8');
    auditStore.replaceAll(kept);
  }
  return expired.length;
}

export function runRotationOnce(): void {
  const files = cleanFiles();
  const records = cleanStore();
  if (files || records) {
    console.log(
      `[rotator] удалено: файлов ${files}, записей ${records}, порог ${config.logRetentionDays} дн.`
    );
  }
}

let timer: NodeJS.Timeout | null = null;

export function startRotator(): void {
  runRotationOnce();
  timer = setInterval(runRotationOnce, DAY_MS);
  if (timer.unref) timer.unref();
}

export function stopRotator(): void {
  if (timer) clearInterval(timer);
  timer = null;
}
