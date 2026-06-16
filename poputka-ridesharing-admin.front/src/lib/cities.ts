import { supabase } from './supabase';

export interface DbCity {
  id: number;
  name: string;
}

export async function fetchCities(): Promise<DbCity[]> {
  const { data, error } = await supabase
    .from('cities')
    .select('id, name')
    .order('name', { ascending: true });
  if (error) throw error;
  return (data ?? []) as DbCity[];
}

export async function createCity(name: string): Promise<DbCity> {
  const payload = { name: name.trim() };
  const { data, error } = await supabase
    .from('cities')
    .insert(payload)
    .select('id, name')
    .single();
  if (error) throw error;
  return data as DbCity;
}

export async function updateCity(id: number, name: string): Promise<void> {
  const payload = { name: name.trim() };
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
