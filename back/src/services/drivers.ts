import { Driver } from '../types';
import { createStore } from './store';
import { recordAudit } from './audit';

const driversStore = createStore<Driver>('drivers.json');

export function listDrivers(): Driver[] {
  return driversStore.list();
}

export function suspendDriver(id: string, adminName: string): Driver | null {
  const driver = driversStore.update(id, { status: 'suspended' });
  if (!driver) return null;
  recordAudit({
    adminName,
    action: 'Приостановка водителя',
    targetType: 'user_state',
    targetId: driver.id,
    details: `Приостановлен водитель ${driver.name}`,
  });
  return driver;
}

export function activateDriver(id: string, adminName: string): Driver | null {
  const driver = driversStore.update(id, { status: 'active' });
  if (!driver) return null;
  recordAudit({
    adminName,
    action: 'Возобновление водителя',
    targetType: 'user_state',
    targetId: driver.id,
    details: `Водитель ${driver.name} снова активен`,
  });
  return driver;
}

export { driversStore };
