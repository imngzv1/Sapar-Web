import { supabase } from './supabase';

export interface RoutePriceIndex {
  route: string;
  averagePrice: number;
  passengerCount: number;
  growth: string;
}

export interface TopDriver {
  id: string;
  name: string;
  carModel: string;
  avatar: string;
  rating: number;
  completedRides: number;
}

export interface AnalyticsData {
  topDriversCount: number;
  tripsWithoutComplaintsPercent: number;
  occupancyPercent: number;
  routePriceIndex: RoutePriceIndex[];
  topDrivers: TopDriver[];
}

interface DbRideRow {
  id: string;
  driver_id: string;
  from_city_id: number;
  to_city_id: number;
  price: number;
  total_seats: number;
  free_seats: number;
}

interface DbCityRow {
  id: number;
  name: string;
}

interface DbReviewRow {
  ride_id: string | null;
  rating: number | null;
}

interface DbBookingRow {
  ride_id: string;
  seats_count: number;
  status: string;
}

interface DbDriverRow {
  id: string;
  brand: string;
  rating: number | null;
  trips_count: number | null;
  is_verified: boolean | null;
}

interface DbUserRow {
  id: string;
  name: string;
  last_name: string | null;
  rating: number | null;
  trips_count: number | null;
}

const TOP_RATING_THRESHOLD = 4.8;
const COMPLAINT_RATING_THRESHOLD = 4;

function avatarUrl(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=BFCFC2&color=476673&size=150`;
}

function fullName(user: DbUserRow): string {
  return [user.name, user.last_name].filter(Boolean).join(' ');
}

function formatPercent(value: number): number {
  return Math.round(value * 10) / 10;
}

function driverRating(driver: DbDriverRow, user?: DbUserRow): number {
  return user?.rating ?? driver.rating ?? 0;
}

function driverTrips(driver: DbDriverRow, user?: DbUserRow): number {
  return user?.trips_count ?? driver.trips_count ?? 0;
}

export async function fetchAnalytics(): Promise<AnalyticsData> {
  const [ridesRes, citiesRes, reviewsRes, bookingsRes, driversRes, usersRes] =
    await Promise.all([
      supabase
        .from('rides')
        .select('id, driver_id, from_city_id, to_city_id, price, total_seats, free_seats'),
      supabase.from('cities').select('id, name'),
      supabase.from('reviews').select('ride_id, rating'),
      supabase.from('bookings').select('ride_id, seats_count, status'),
      supabase
        .from('drivers')
        .select('id, brand, rating, trips_count, is_verified')
        .eq('is_verified', true),
      supabase
        .from('users')
        .select('id, name, last_name, rating, trips_count')
        .eq('is_driver', true),
    ]);

  const firstError = [
    ridesRes,
    citiesRes,
    reviewsRes,
    bookingsRes,
    driversRes,
    usersRes,
  ].find((r) => r.error);
  if (firstError?.error) throw firstError.error;

  const rides = (ridesRes.data ?? []) as DbRideRow[];
  const cities = new Map(
    ((citiesRes.data ?? []) as DbCityRow[]).map((c) => [c.id, c.name]),
  );
  const reviews = (reviewsRes.data ?? []) as DbReviewRow[];
  const bookings = (bookingsRes.data ?? []) as DbBookingRow[];
  const drivers = (driversRes.data ?? []) as DbDriverRow[];
  const users = new Map(
    ((usersRes.data ?? []) as DbUserRow[]).map((u) => [u.id, u]),
  );

  const complaintRideIds = new Set(
    reviews
      .filter((r) => r.ride_id && r.rating != null && r.rating < COMPLAINT_RATING_THRESHOLD)
      .map((r) => r.ride_id as string),
  );

  const totalRides = rides.length;
  const ridesWithComplaints = rides.filter((r) => complaintRideIds.has(r.id)).length;
  const tripsWithoutComplaintsPercent =
    totalRides === 0
      ? 100
      : formatPercent(((totalRides - ridesWithComplaints) / totalRides) * 100);

  const totalSeats = rides.reduce((sum, r) => sum + r.total_seats, 0);
  const occupiedSeats = rides.reduce(
    (sum, r) => sum + (r.total_seats - r.free_seats),
    0,
  );
  const occupancyPercent =
    totalSeats === 0 ? 0 : formatPercent((occupiedSeats / totalSeats) * 100);

  const passengersByRide = new Map<string, number>();
  for (const booking of bookings) {
    if (booking.status === 'cancelled') continue;
    passengersByRide.set(
      booking.ride_id,
      (passengersByRide.get(booking.ride_id) ?? 0) + booking.seats_count,
    );
  }

  const routeMap = new Map<
    string,
    { fromName: string; toName: string; prices: number[]; passengerCount: number }
  >();

  for (const ride of rides) {
    const fromName = cities.get(ride.from_city_id) ?? `#${ride.from_city_id}`;
    const toName = cities.get(ride.to_city_id) ?? `#${ride.to_city_id}`;
    const key = `${ride.from_city_id}-${ride.to_city_id}`;

    const entry = routeMap.get(key) ?? {
      fromName,
      toName,
      prices: [],
      passengerCount: 0,
    };
    entry.prices.push(ride.price);
    entry.passengerCount += passengersByRide.get(ride.id) ?? 0;
    routeMap.set(key, entry);
  }

  const routePriceIndex: RoutePriceIndex[] = [...routeMap.values()]
    .map((route) => ({
      route: `${route.fromName} ⇆ ${route.toName}`,
      averagePrice: Math.round(
        route.prices.reduce((a, b) => a + b, 0) / route.prices.length,
      ),
      passengerCount: route.passengerCount,
      growth: '—',
    }))
    .sort((a, b) => b.passengerCount - a.passengerCount || b.averagePrice - a.averagePrice);

  const topDriversCount = drivers.filter((driver) => {
    const rating = driverRating(driver, users.get(driver.id));
    return rating >= TOP_RATING_THRESHOLD;
  }).length;

  const topDrivers: TopDriver[] = drivers
    .map((driver) => {
      const user = users.get(driver.id);
      const name = user ? fullName(user) : '—';
      const rating = driverRating(driver, user);
      const completedRides = driverTrips(driver, user);
      return {
        id: driver.id,
        name,
        carModel: driver.brand,
        avatar: avatarUrl(name),
        rating,
        completedRides,
      };
    })
    .sort((a, b) => b.rating - a.rating || b.completedRides - a.completedRides)
    .slice(0, 10);

  return {
    topDriversCount,
    tripsWithoutComplaintsPercent,
    occupancyPercent,
    routePriceIndex,
    topDrivers,
  };
}
