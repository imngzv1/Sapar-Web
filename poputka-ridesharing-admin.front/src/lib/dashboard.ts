import { supabase } from './supabase';

export interface DashboardStats {
  totalUsers: number;
  totalDrivers: number;
  activeRides: number;
  pendingVerifications: number;
}

export interface ChartDayPoint {
  day: string;
  users: number;
  rides: number;
}

export interface PopularRoute {
  from: string;
  to: string;
  count: number;
}

export interface DashboardData {
  stats: DashboardStats;
  chart7Days: ChartDayPoint[];
  chart30Days: ChartDayPoint[];
  popularRoutes: PopularRoute[];
  citiesCount: number;
}

interface DbUserCreated {
  created_at: string;
}

interface DbRideRow {
  created_at?: string | null;
  start_date?: string | null;
  from_city_id: number;
  to_city_id: number;
}

interface DbCityRow {
  id: number;
  name: string;
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function localDateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function dayLabel(d: Date): string {
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}`;
}

function parseToLocalDateKey(raw: string): string | null {
  if (!raw) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    const [y, m, day] = raw.slice(0, 10).split('-').map(Number);
    return `${y}-${pad(m)}-${pad(day)}`;
  }
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return localDateKey(d);
}

function buildDayBuckets(days: number): Map<string, ChartDayPoint> {
  const buckets = new Map<string, ChartDayPoint>();
  const today = startOfDay(new Date());
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = localDateKey(d);
    buckets.set(key, { day: dayLabel(d), users: 0, rides: 0 });
  }
  return buckets;
}

function bucketsToArray(buckets: Map<string, ChartDayPoint>): ChartDayPoint[] {
  return Array.from(buckets.values());
}

function fillChartData(
  users: DbUserCreated[],
  rides: DbRideRow[],
  days: 7 | 30,
): ChartDayPoint[] {
  const buckets = buildDayBuckets(days);
  const keys = new Set(buckets.keys());

  for (const user of users) {
    const key = parseToLocalDateKey(user.created_at);
    if (key && keys.has(key)) {
      buckets.get(key)!.users += 1;
    }
  }

  for (const ride of rides) {
    const raw = ride.created_at ?? ride.start_date;
    const key = raw ? parseToLocalDateKey(raw) : null;
    if (key && keys.has(key)) {
      buckets.get(key)!.rides += 1;
    }
  }

  return bucketsToArray(buckets);
}

function buildPopularRoutes(
  rides: DbRideRow[],
  cities: Map<number, string>,
  limit = 5,
): PopularRoute[] {
  const routeCounts = new Map<string, PopularRoute>();

  for (const ride of rides) {
    const from = cities.get(ride.from_city_id) ?? `#${ride.from_city_id}`;
    const to = cities.get(ride.to_city_id) ?? `#${ride.to_city_id}`;
    const key = `${ride.from_city_id}-${ride.to_city_id}`;
    const entry = routeCounts.get(key) ?? { from, to, count: 0 };
    entry.count += 1;
    routeCounts.set(key, entry);
  }

  return [...routeCounts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const [usersRes, driversRes, activeRidesRes, pendingRes, chartUsersRes, ridesRes, citiesRes] =
    await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('drivers').select('*', { count: 'exact', head: true }),
      supabase
        .from('rides')
        .select('*', { count: 'exact', head: true })
        .in('status', ['waiting', 'on_way', 'active']),
      supabase
        .from('drivers')
        .select('*', { count: 'exact', head: true })
        .eq('is_verified', false),
      supabase.from('users').select('created_at'),
      supabase.from('rides').select('created_at, start_date, from_city_id, to_city_id'),
      supabase.from('cities').select('id, name'),
    ]);

  const first = [
    usersRes,
    driversRes,
    activeRidesRes,
    pendingRes,
    chartUsersRes,
    ridesRes,
    citiesRes,
  ].find((r) => r.error);
  if (first?.error) throw first.error;

  const chartUsers = (chartUsersRes.data ?? []) as DbUserCreated[];
  const rides = (ridesRes.data ?? []) as DbRideRow[];
  const cities = new Map(
    ((citiesRes.data ?? []) as DbCityRow[]).map((c) => [c.id, c.name]),
  );

  const stats: DashboardStats = {
    totalUsers: usersRes.count ?? 0,
    totalDrivers: driversRes.count ?? 0,
    activeRides: activeRidesRes.count ?? 0,
    pendingVerifications: pendingRes.count ?? 0,
  };

  return {
    stats,
    chart7Days: fillChartData(chartUsers, rides, 7),
    chart30Days: fillChartData(chartUsers, rides, 30),
    popularRoutes: buildPopularRoutes(rides, cities),
    citiesCount: cities.size,
  };
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const data = await fetchDashboardData();
  return data.stats;
}
