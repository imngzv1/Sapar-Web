/*
  Журнал действий администратора. Каждое действие уходит:
    1) в admin_logs (пока — db/seed/logs.json) — это читает фронт через /api/logs;
    2) в файл ../logs/admin-actions-YYYY-MM-DD.log (строки JSON);
    3) в stdout — попадает в pm2 logs.
*/

import fs from 'fs';
import path from 'path';

import { config } from '../config';
import { AdminLog, AdminLogTargetType } from '../types';
import { createStore, nextId, formatDateTime, isoDate } from './store';

const logsStore = createStore<AdminLog>('logs.json');

export function ensureLogsDir(): void {
  if (!fs.existsSync(config.logsDir)) {
    fs.mkdirSync(config.logsDir, { recursive: true });
  }
}

function dailyFilePath(d = new Date()): string {
  return path.join(config.logsDir, `admin-actions-${isoDate(d)}.log`);
}

interface RecordArgs {
  adminName: string;
  action: string;
  targetType: AdminLogTargetType;
  targetId: string;
  details: string;
}

export function recordAudit(args: RecordArgs): AdminLog {
  const entry: AdminLog = {
    id: nextId('log'),
    adminName: args.adminName || config.defaultAdminName,
    action: args.action,
    targetType: args.targetType,
    targetId: args.targetId,
    date: formatDateTime(),
    details: args.details,
  };

  logsStore.add(entry);

  try {
    ensureLogsDir();
    fs.appendFileSync(dailyFilePath(), JSON.stringify(entry) + '\n', 'utf8');
  } catch (err) {
    console.error('[audit] не удалось записать в файл:', (err as Error).message);
  }

  process.stdout.write(
    `[audit] ${entry.date} ${entry.adminName} | ${entry.action} | ${entry.targetType}:${entry.targetId} | ${entry.details}\n`
  );

  return entry;
}

export function listAuditLogs(): AdminLog[] {
  const all = logsStore.list();
  return [...all].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

export const auditStore = logsStore;
