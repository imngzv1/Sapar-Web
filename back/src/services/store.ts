/*
  Простой in-memory CRUD поверх JSON-файлов из db/seed/.
  Каждый сервис создаёт свой store через createStore<T>('users.json').

  Когда подключим базу — этот файл можно выбросить, а в сервисах
  заменить вызовы на SQL-запросы через src/db/connection.ts.
*/

import fs from 'fs';
import path from 'path';
import { config } from '../config';

export interface Store<T extends { id: string }> {
  list(): T[];
  find(id: string): T | undefined;
  where(predicate: (item: T) => boolean): T[];
  add(item: T): T;
  update(id: string, patch: Partial<T>): T | null;
  remove(id: string): boolean;
  replaceAll(items: T[]): void;
}

export function createStore<T extends { id: string }>(fileName: string): Store<T> {
  const fullPath = path.join(config.seedDir, fileName);

  function read(): T[] {
    const raw = fs.readFileSync(fullPath, 'utf8');
    return JSON.parse(raw) as T[];
  }

  function write(items: T[]): void {
    fs.writeFileSync(fullPath, JSON.stringify(items, null, 2) + '\n', 'utf8');
  }

  return {
    list() {
      return read();
    },
    find(id) {
      return read().find((it) => it.id === id);
    },
    where(predicate) {
      return read().filter(predicate);
    },
    add(item) {
      const items = read();
      items.unshift(item);
      write(items);
      return item;
    },
    update(id, patch) {
      const items = read();
      const idx = items.findIndex((it) => it.id === id);
      if (idx === -1) return null;
      items[idx] = { ...items[idx], ...patch };
      write(items);
      return items[idx];
    },
    remove(id) {
      const items = read();
      const idx = items.findIndex((it) => it.id === id);
      if (idx === -1) return false;
      items.splice(idx, 1);
      write(items);
      return true;
    },
    replaceAll(items) {
      write(items);
    },
  };
}

let counter = 0;
export function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}_${Date.now()}_${counter}`;
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export function formatDate(d = new Date()): string {
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
}

export function formatDateTime(d = new Date()): string {
  return `${formatDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function isoDate(d = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
