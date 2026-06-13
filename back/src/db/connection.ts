/*
  Заглушка под SQL.
  Сейчас данные в JSON (см. db/seed/*.json) — сервисы работают через src/services/store.ts.
  Когда подключим базу:
    1) поставить драйвер (pg / mysql2);
    2) поднять пул соединений из config.db;
    3) экспортировать query() и переключить сервисы на SQL.
*/

import { config } from '../config';

let pool: unknown = null;

export function initDb(): void {
  // const { Pool } = await import('pg');
  // pool = new Pool({ ... });
  void config;
}

export async function query<T = unknown>(_sql: string, _params?: unknown[]): Promise<T[]> {
  throw new Error('БД ещё не подключена. См. src/db/connection.ts');
}

export function isDbReady(): boolean {
  return pool !== null;
}
