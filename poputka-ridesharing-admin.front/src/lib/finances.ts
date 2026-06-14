import { supabase } from './supabase';

export interface FinanceStats {
  grossVolume: number;
  serviceCommission: number;
  driverPayoutsTotal: number;
}

export interface FinanceTransaction {
  id: string;
  transactionCode: string;
  driverId: string;
  driverName: string;
  rideId: string;
  amount: number;
  commission: number;
  driverPayout: number;
  date: string;
  createdAt: string;
  status: string;
  statusLabel: string;
}

export interface FinanceRefund {
  id: string;
  rideId: string;
  passengerId: string;
  passengerName: string;
  amount: number;
  date: string;
  createdAt: string;
  reason: string;
}

interface DbTransaction {
  id: string;
  ride_id: string;
  driver_id: string;
  total_collected: number | string;
  platform_commission: number | string;
  driver_payout: number | string;
  status: string;
  transaction_code: string;
  created_at: string;
}

interface DbDriverUser {
  name: string;
  last_name: string | null;
}

interface DbDriverRow {
  id: string;
  user: DbDriverUser | null;
}

interface DbBookingRow {
  id: string;
  ride_id: string;
  passenger_id: string;
  seats_count: number;
  status: string;
  created_at: string;
}

interface DbRidePrice {
  id: string;
  price: number;
}

interface DbPassengerRow {
  id: string;
  name: string;
  last_name: string | null;
}

function toNumber(value: number | string | null | undefined): number {
  return Number(value ?? 0);
}

function fullName(user: DbDriverUser | DbPassengerRow | null | undefined): string {
  if (!user) return '—';
  return [user.name, user.last_name].filter(Boolean).join(' ');
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ru-RU', { timeZone: 'UTC' }).replace(',', '');
  } catch {
    return iso;
  }
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('ru-RU');
  } catch {
    return iso;
  }
}

function mapTransactionStatus(status: string): { status: string; label: string } {
  const s = status.toLowerCase();
  if (s === 'payout_success' || s === 'completed' || s === 'success') {
    return { status: 'completed', label: 'Успешно' };
  }
  if (s === 'refunded' || s === 'refund') {
    return { status: 'refunded', label: 'Возвращено' };
  }
  if (s === 'pending') {
    return { status: 'pending', label: 'Ожидает' };
  }
  return { status: s, label: status };
}

async function fetchDriverNameMap(driverIds: string[]): Promise<Map<string, string>> {
  if (!driverIds.length) return new Map();

  const { data, error } = await supabase
    .from('drivers')
    .select('id, user:users!drivers_id_fkey(name, last_name)')
    .in('id', driverIds);
  if (error) throw error;

  const map = new Map<string, string>();
  for (const row of (data ?? []) as unknown as DbDriverRow[]) {
    map.set(row.id, fullName(row.user));
  }
  return map;
}

export async function fetchFinanceStats(): Promise<FinanceStats> {
  const { data, error } = await supabase
    .from('transactions')
    .select('total_collected, platform_commission, driver_payout');
  if (error) throw error;

  return (data as DbTransaction[] ?? []).reduce(
    (acc, row) => ({
      grossVolume: acc.grossVolume + toNumber(row.total_collected),
      serviceCommission: acc.serviceCommission + toNumber(row.platform_commission),
      driverPayoutsTotal: acc.driverPayoutsTotal + toNumber(row.driver_payout),
    }),
    { grossVolume: 0, serviceCommission: 0, driverPayoutsTotal: 0 },
  );
}

export async function fetchFinanceTransactions(): Promise<FinanceTransaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select(
      'id, ride_id, driver_id, total_collected, platform_commission, driver_payout, status, transaction_code, created_at',
    )
    .order('created_at', { ascending: false });
  if (error) throw error;
  if (!data?.length) return [];

  const rows = data as DbTransaction[];
  const driverIds = [...new Set(rows.map((r) => r.driver_id))];
  const driverNames = await fetchDriverNameMap(driverIds);

  return rows.map((row) => {
    const { status, label } = mapTransactionStatus(row.status);
    return {
      id: row.id,
      transactionCode: row.transaction_code,
      driverId: row.driver_id,
      driverName: driverNames.get(row.driver_id) ?? '—',
      rideId: row.ride_id,
      amount: toNumber(row.total_collected),
      commission: toNumber(row.platform_commission),
      driverPayout: toNumber(row.driver_payout),
      date: formatDateTime(row.created_at),
      createdAt: row.created_at,
      status,
      statusLabel: label,
    };
  });
}

export async function fetchFinanceRefunds(): Promise<FinanceRefund[]> {
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('id, ride_id, passenger_id, seats_count, status, created_at')
    .eq('status', 'cancelled')
    .order('created_at', { ascending: false });
  if (error) throw error;
  if (!bookings?.length) return [];

  const rows = bookings as DbBookingRow[];
  const rideIds = [...new Set(rows.map((b) => b.ride_id))];
  const passengerIds = [...new Set(rows.map((b) => b.passenger_id))];

  const [ridesRes, passengersRes] = await Promise.all([
    supabase.from('rides').select('id, price').in('id', rideIds),
    supabase.from('users').select('id, name, last_name').in('id', passengerIds),
  ]);

  if (ridesRes.error) throw ridesRes.error;
  if (passengersRes.error) throw passengersRes.error;

  const priceMap = new Map(
    ((ridesRes.data ?? []) as DbRidePrice[]).map((r) => [r.id, r.price]),
  );
  const passengerMap = new Map(
    ((passengersRes.data ?? []) as DbPassengerRow[]).map((p) => [p.id, p]),
  );

  return rows.map((booking) => {
    const price = priceMap.get(booking.ride_id) ?? 0;
    const passenger = passengerMap.get(booking.passenger_id);
    return {
      id: booking.id,
      rideId: booking.ride_id,
      passengerId: booking.passenger_id,
      passengerName: fullName(passenger ?? null),
      amount: price * booking.seats_count,
      date: formatDate(booking.created_at),
      createdAt: booking.created_at,
      reason: 'Бронирование отменено — средства возвращены пассажиру.',
    };
  });
}

export function computeFinanceStats(transactions: FinanceTransaction[]): FinanceStats {
  return transactions.reduce(
    (acc, row) => ({
      grossVolume: acc.grossVolume + row.amount,
      serviceCommission: acc.serviceCommission + row.commission,
      driverPayoutsTotal: acc.driverPayoutsTotal + row.driverPayout,
    }),
    { grossVolume: 0, serviceCommission: 0, driverPayoutsTotal: 0 },
  );
}

export function matchesYearMonth(iso: string, year: number, month: number): boolean {
  const d = new Date(iso);
  return d.getFullYear() === year && d.getMonth() + 1 === month;
}

export async function fetchFinances() {
  const [stats, transactions, refunds] = await Promise.all([
    fetchFinanceStats(),
    fetchFinanceTransactions(),
    fetchFinanceRefunds(),
  ]);
  return { stats, transactions, refunds };
}
