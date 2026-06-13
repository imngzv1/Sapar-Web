import { City } from '../types';
import { createStore, nextId } from './store';
import { recordAudit } from './audit';

const citiesStore = createStore<City>('cities.json');

export function listCities(): City[] {
  return citiesStore.list();
}

export function createCity(name: string, adminName: string): City {
  const city = citiesStore.add({
    id: nextId('cit'),
    name: name.trim(),
    status: 'active',
    ridesCount: 0,
  });
  recordAudit({
    adminName,
    action: 'Добавление города',
    targetType: 'city',
    targetId: city.id,
    details: `Добавлен город ${city.name}`,
  });
  return city;
}

export function toggleCity(id: string, adminName: string): City | null {
  const current = citiesStore.find(id);
  if (!current) return null;
  const next: City['status'] = current.status === 'active' ? 'inactive' : 'active';
  const city = citiesStore.update(id, { status: next })!;

  recordAudit({
    adminName,
    action: next === 'active' ? 'Включение города' : 'Отключение города',
    targetType: 'city',
    targetId: city.id,
    details: `${city.name} — статус: ${next === 'active' ? 'активен' : 'отключён'}`,
  });
  return city;
}

export function removeCity(id: string, adminName: string): boolean {
  const city = citiesStore.find(id);
  if (!city) return false;
  citiesStore.remove(id);
  recordAudit({
    adminName,
    action: 'Удаление города',
    targetType: 'city',
    targetId: city.id,
    details: `Удалён город ${city.name}`,
  });
  return true;
}
