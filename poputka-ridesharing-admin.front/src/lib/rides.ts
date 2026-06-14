import { supabase } from './supabase';
import { Ride, RideStatus } from '../types';

export interface DbCityRef {
  name: string;
}

export interface DbPassengerRef {
  name: string;
  last_name: string | null;
  phone: string;
}

export interface DbBookingRow {
  id: string;
  passenger_id: string;
  seats_count: number;
  status: string;
  passenger: DbPassengerRef | null;
}

export interface DbDriverRef {
  id: string;
  brand: string;
  user: {
    name: string;
    last_name: string | null;
    phone: string;
  } | null;
}

export interface DbRide {
  id: string;
  driver_id: string;
  from_city_id: number;
  to_city_id: number;
  start_date: string | null;
  start_time: string;
  price: number;
  status: string;
  total_seats: number;
  free_seats: number;
  from_city: DbCityRef | null;
  to_city: DbCityRef | null;
  driver: DbDriverRef | null;
  bookings: DbBookingRow[] | null;
}

const RIDE_SELECT = `
  id, driver_id, from_city_id, to_city_id, start_date, start_time,
  price, status, total_seats, free_seats,
  from_city:cities!rides_from_city_id_fkey(name),
  to_city:cities!rides_to_city_id_fkey(name),
  driver:drivers!rides_driver_id_fkey(
    id, brand,
    user:users!drivers_id_fkey(name, last_name, phone)
  ),
  bookings(
    id, passenger_id, seats_count, status,
    passenger:users!bookings_passenger_id_fkey(name, last_name, phone)
  )
`;

function avatarUrl(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=BFCFC2&color=476673&size=150`;
}

function formatRideTime(time: string): string {
  if (!time) return '—';
  const match = time.match(/(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : time;
}

function formatRideDate(date: string | null): string {
  if (!date) return '—';
  const d = new Date(`${date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (d.getTime() === today.getTime()) return 'Сегодня';
  if (d.getTime() === tomorrow.getTime()) return 'Завтра';
  return d.toLocaleDateString('ru-RU');
}

function mapRideStatus(status: string): RideStatus {
  const s = status.toLowerCase();
  if (s === 'completed') return 'Completed';
  if (s === 'cancelled' || s === 'canceled') return 'Cancelled';
  return 'Active';
}

function passengerName(p: DbPassengerRef | null): string {
  if (!p) return '—';
  return [p.name, p.last_name].filter(Boolean).join(' ');
}

export function mapDbRideToRide(db: DbRide): Ride {
  const driverName = db.driver?.user ? passengerName(db.driver.user) : '—';
  const occupiedSeats = db.total_seats - db.free_seats;

  const passengers = (db.bookings ?? [])
    .filter((b) => b.status !== 'cancelled')
    .map((b) => ({
      id: b.passenger_id,
      name: passengerName(b.passenger),
      phone: b.passenger?.phone ?? '—',
    }));

  return {
    id: db.id,
    driverId: db.driver_id,
    driverName,
    driverAvatar: avatarUrl(driverName),
    fromCity: db.from_city?.name ?? `#${db.from_city_id}`,
    toCity: db.to_city?.name ?? `#${db.to_city_id}`,
    date: formatRideDate(db.start_date),
    time: formatRideTime(db.start_time),
    price: db.price,
    totalSeats: db.total_seats,
    occupiedSeats,
    status: mapRideStatus(db.status),
    dbStatus: db.status,
    carModel: db.driver?.brand ?? '—',
    passengers,
  };
}

export async function fetchRides(): Promise<Ride[]> {
  const { data, error } = await supabase
    .from('rides')
    .select(RIDE_SELECT)
    .order('start_date', { ascending: false })
    .order('start_time', { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as DbRide[]).map(mapDbRideToRide);
}

export async function cancelRideInDb(rideId: string): Promise<void> {
  const { error } = await supabase
    .from('rides')
    .update({ status: 'cancelled' })
    .eq('id', rideId);
  if (error) throw error;
}
