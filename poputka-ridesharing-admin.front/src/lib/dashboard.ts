import { supabase } from './supabase';

export interface DashboardStats {
  totalUsers: number;
  totalDrivers: number;
  activeRides: number;
  pendingVerifications: number;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const [usersRes, driversRes, activeRidesRes, pendingRes] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('drivers').select('*', { count: 'exact', head: true }),
    supabase
      .from('rides')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active'),
    supabase
      .from('drivers')
      .select('*', { count: 'exact', head: true })
      .eq('is_verified', false),
  ]);

  const first = [usersRes, driversRes, activeRidesRes, pendingRes].find((r) => r.error);
  if (first?.error) throw first.error;

  return {
    totalUsers: usersRes.count ?? 0,
    totalDrivers: driversRes.count ?? 0,
    activeRides: activeRidesRes.count ?? 0,
    pendingVerifications: pendingRes.count ?? 0,
  };
}
