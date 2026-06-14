import { supabase } from './supabase';
import { Complaint, ComplaintStatus } from '../types';

interface DbUserRow {
  id: string;
  name: string;
  last_name: string | null;
}

interface DbReviewRow {
  id: string;
  ride_id: string | null;
  from_user_id: string | null;
  to_driver_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
}

const RATING_THRESHOLD = 4;

function fullName(user: Pick<DbUserRow, 'name' | 'last_name'> | undefined): string {
  if (!user) return '—';
  return [user.name, user.last_name].filter(Boolean).join(' ');
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('ru-RU');
  } catch {
    return iso;
  }
}

function mapCategory(rating: number): Complaint['category'] {
  if (rating <= 1) return 'rudeness';
  if (rating === 2) return 'reckless_driving';
  if (rating === 3) return 'car_dirty';
  return 'other';
}

function mapReviewToComplaint(
  review: DbReviewRow,
  reporter: DbUserRow | undefined,
  driver: DbUserRow | undefined,
  status: ComplaintStatus = 'Pending',
  decision?: string,
): Complaint {
  return {
    id: review.id,
    reporterId: review.from_user_id ?? '',
    reporterName: fullName(reporter),
    reportedId: review.to_driver_id ?? '',
    reportedName: fullName(driver),
    reportedRole: 'driver',
    category: mapCategory(review.rating),
    text: review.comment?.trim() || '—',
    date: formatDate(review.created_at),
    status,
    decision,
  };
}

export async function fetchComplaints(): Promise<Complaint[]> {
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('id, ride_id, from_user_id, to_driver_id, rating, comment, created_at')
    .not('to_driver_id', 'is', null)
    .lt('rating', RATING_THRESHOLD)
    .order('created_at', { ascending: false });
  if (error) throw error;
  if (!reviews?.length) return [];

  const userIds = new Set<string>();
  for (const review of reviews as DbReviewRow[]) {
    if (review.from_user_id) userIds.add(review.from_user_id);
    if (review.to_driver_id) userIds.add(review.to_driver_id);
  }

  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, name, last_name')
    .in('id', Array.from(userIds));
  if (usersError) throw usersError;

  const userMap = new Map((users as DbUserRow[] ?? []).map((u) => [u.id, u]));

  return (reviews as DbReviewRow[]).map((review) =>
    mapReviewToComplaint(
      review,
      review.from_user_id ? userMap.get(review.from_user_id) : undefined,
      review.to_driver_id ? userMap.get(review.to_driver_id) : undefined,
    ),
  );
}
