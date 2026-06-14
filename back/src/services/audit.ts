/*
  Журнал действий администратора. Каждое действие уходит:
    1) в файл logs/admin-actions-YYYY-MM-DD.log (основное хранилище, читает GET /api/logs);
    2) в db/seed/logs.json (резервная копия для ротации);
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

function readLogsFromFiles(): AdminLog[] {
  ensureLogsDir();
  const byId = new Map<string, AdminLog>();

  let files: string[];
  try {
    files = fs
      .readdirSync(config.logsDir)
      .filter((name) => name.startsWith('admin-actions-') && name.endsWith('.log'))
      .sort();
  } catch {
    return [];
  }

  for (const name of files) {
    const fullPath = path.join(config.logsDir, name);
    let content: string;
    try {
      content = fs.readFileSync(fullPath, 'utf8');
    } catch {
      continue;
    }
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const entry = JSON.parse(trimmed) as AdminLog;
        if (entry?.id) {
          byId.set(entry.id, entry);
        }
      } catch {
        // пропускаем битые строки
      }
    }
  }

  return Array.from(byId.values());
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
  const fromFiles = readLogsFromFiles();
  if (fromFiles.length > 0) {
    return fromFiles.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }
  // если файлов ещё нет — читаем json (обратная совместимость)
  return [...logsStore.list()].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

export const auditStore = logsStore;
