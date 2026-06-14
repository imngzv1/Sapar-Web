-- Админ-панель читает bookings через anon/publishable key (supabase.ts).
-- В SQL Editor Supabase выполни этот скрипт, если в таблице есть строки,
-- а в профиле пассажира показывается «не бронировал поездок».

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_panel_read_bookings" ON public.bookings;

CREATE POLICY "admin_panel_read_bookings"
ON public.bookings
FOR SELECT
TO anon, authenticated
USING (true);
