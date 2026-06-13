import { supabase } from './supabase';
import { DbRideSummary, fetchUserDrivenRides } from './users';

const STORAGE_BUCKET = 'driver_documents';

export function isPdfPath(path: string | null | undefined): boolean {
  if (!path) return false;
  return path.toLowerCase().trim().endsWith('.pdf');
}

export function buildDocumentUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const trimmed = path.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  const cleanPath = trimmed.replace(/^\/+/, '');
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(cleanPath);
  return data.publicUrl;
}

export interface DriverUserInfo {
  name: string;
  last_name: string | null;
  phone: string;
  email: string;
  rating: number | null;
  trips_count: number | null;
}

export interface DbDriver {
  id: string;
  brand: string;
  number: string;
  color: string;
  photo_passport: string;
  photo_license_car: string;
  photo_tech_passport: string;
  photo_medical_certificate: string | null;
  photo_criminal_record: string | null;
  is_verified: boolean | null;
  created_at: string | null;
  user: DriverUserInfo | null;
}

const DRIVER_SELECT = `
  id, brand, number, color,
  photo_passport, photo_license_car, photo_tech_passport,
  photo_medical_certificate, photo_criminal_record,
  is_verified, created_at,
  user:users!drivers_id_fkey(name, last_name, phone, email, rating, trips_count)
`;

export async function fetchVerifiedDrivers(): Promise<DbDriver[]> {
  const { data, error } = await supabase
    .from('drivers')
    .select(DRIVER_SELECT)
    .eq('is_verified', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as DbDriver[];
}

export async function fetchPendingDrivers(): Promise<DbDriver[]> {
  const { data, error } = await supabase
    .from('drivers')
    .select(DRIVER_SELECT)
    .eq('is_verified', false)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as DbDriver[];
}

export async function revokeDriverVerification(driverId: string): Promise<void> {
  const { error } = await supabase
    .from('drivers')
    .update({ is_verified: false })
    .eq('id', driverId);
  if (error) throw error;
}

export async function approveDriverVerification(driverId: string): Promise<void> {
  const { error } = await supabase
    .from('drivers')
    .update({ is_verified: true })
    .eq('id', driverId);
  if (error) throw error;
}

export async function fetchDriverPayoutSum(driverId: string): Promise<number> {
  const { data, error } = await supabase
    .from('transactions')
    .select('driver_payout')
    .eq('driver_id', driverId);
  if (error) throw error;
  return (data ?? []).reduce(
    (acc: number, t: any) => acc + Number(t.driver_payout ?? 0),
    0,
  );
}

export async function fetchDriverRides(driverId: string): Promise<DbRideSummary[]> {
  return fetchUserDrivenRides(driverId);
}
