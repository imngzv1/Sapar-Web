import { AdminLog } from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

function adminHeaders(adminName: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'X-Admin-Name': adminName,
  };
}

export async function fetchAdminLogs(): Promise<AdminLog[]> {
  const res = await fetch(`${API_BASE}/api/logs`);
  if (!res.ok) {
    throw new Error('Не удалось загрузить журнал действий');
  }
  return res.json();
}

export async function createAdminLog(entry: {
  adminName: string;
  action: string;
  targetType: AdminLog['targetType'];
  targetId: string;
  details: string;
}): Promise<AdminLog> {
  const res = await fetch(`${API_BASE}/api/logs`, {
    method: 'POST',
    headers: adminHeaders(entry.adminName),
    body: JSON.stringify({
      action: entry.action,
      targetType: entry.targetType,
      targetId: entry.targetId,
      details: entry.details,
    }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'Не удалось записать действие в журнал');
  }
  return res.json();
}
