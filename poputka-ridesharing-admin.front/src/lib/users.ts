import { supabase } from './supabase';

export interface DbUser {
  id: string;
  phone: string;
  email: string;
  name: string;
  last_name: string | null;
  rating: number | null;
  trips_count: number | null;
  is_driver: boolean | null;
  created_at: string;
}

export async function fetchUsers(): Promise<DbUser[]> {
  const { data, error } = await supabase
    .from('users')
    .select('id, phone, email, name, last_name, rating, trips_count, is_driver, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as DbUser[];
}

export interface DbCityRef {
  name: string;
}

export interface DbRideSummary {
  id: string;
  from_city_id: number;
  to_city_id: number;
  start_date: string | null;
  start_time: string;
  end_time: string | null;
  price: number;
  status: string;
  total_seats: number;
  free_seats: number;
  from_city: DbCityRef | null;
  to_city: DbCityRef | null;
}

const RIDE_SELECT = `
  id, from_city_id, to_city_id, start_date, start_time, end_time,
  price, status, total_seats, free_seats,
  from_city:cities!rides_from_city_id_fkey(name),
  to_city:cities!rides_to_city_id_fkey(name)
`;

export async function fetchUserDrivenRides(userId: string): Promise<DbRideSummary[]> {
  const { data, error } = await supabase
    .from('rides')
    .select(RIDE_SELECT)
    .eq('driver_id', userId)
    .order('start_date', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as DbRideSummary[];
}

export interface DbBooking {
  id: string;
  seats_count: number;
  status: string;
  created_at: string;
  ride: DbRideSummary | null;
}

export async function fetchUserBookings(userId: string): Promise<DbBooking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      id, seats_count, status, created_at,
      ride:rides!bookings_ride_id_fkey(${RIDE_SELECT})
    `)
    .eq('passenger_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as DbBooking[];
}
