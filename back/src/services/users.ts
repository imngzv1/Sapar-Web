import { User, Driver } from '../types';
import { createStore } from './store';
import { recordAudit } from './audit';

const usersStore = createStore<User>('users.json');
const driversStore = createStore<Driver>('drivers.json');

export function listUsers(): User[] {
  return usersStore.list();
}

export function getUser(id: string): User | null {
  return usersStore.find(id) ?? null;
}

export function blockUser(id: string, reason: string, adminName: string): User | null {
  const user = usersStore.update(id, { status: 'blocked', blockReason: reason });
  if (!user) return null;

  const driver = driversStore.where((d) => d.userId === id)[0];
  if (driver) driversStore.update(driver.id, { status: 'suspended' });

  recordAudit({
    adminName,
    action: 'Блокировка аккаунта',
    targetType: 'user_state',
    targetId: id,
    details: `Заблокирован пользователь ${user.name}. Причина: ${reason}`,
  });
  return user;
}

export function unblockUser(id: string, adminName: string): User | null {
  const user = usersStore.update(id, { status: 'active', blockReason: undefined });
  if (!user) return null;

  const driver = driversStore.where((d) => d.userId === id)[0];
  if (driver) driversStore.update(driver.id, { status: 'active' });

  recordAudit({
    adminName,
    action: 'Разблокировка аккаунта',
    targetType: 'user_state',
    targetId: id,
    details: `Снята блокировка с пользователя ${user.name}`,
  });
  return user;
}
