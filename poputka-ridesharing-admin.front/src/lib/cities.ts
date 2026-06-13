import { supabase } from './supabase';

export interface DbCity {
  id: number;
  name: string;
  regoin: string | null;
}

export async function fetchCities(): Promise<DbCity[]> {
  const { data, error } = await supabase
    .from('cities')
    .select('id, name, regoin')
    .order('name', { ascending: true });
  if (error) throw error;
  return (data ?? []) as DbCity[];
}

export async function createCity(name: string, regoin: string | null): Promise<DbCity> {
  const payload = { name: name.trim(), regoin: regoin?.trim() || null };
  const { data, error } = await supabase
    .from('cities')
    .insert(payload)
    .select('id, name, regoin')
    .single();
  if (error) throw error;
  return data as DbCity;
}

export async function updateCity(
  id: number,
  name: string,
  regoin: string | null,
): Promise<void> {
  const payload = { name: name.trim(), regoin: regoin?.trim() || null };
  const { error } = await supabase.from('cities').update(payload).eq('id', id);
  if (error) throw error;
}

export async function deleteCity(id: number): Promise<void> {
  const { error } = await supabase.from('cities').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchCityRidesCount(cityId: number): Promise<number> {
  const { count, error } = await supabase
    .from('rides')
    .select('*', { count: 'exact', head: true })
    .or(`from_city_id.eq.${cityId},to_city_id.eq.${cityId}`);
  if (error) throw error;
  return count ?? 0;
}
