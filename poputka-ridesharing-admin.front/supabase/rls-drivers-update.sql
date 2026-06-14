-- Админ-панель обновляет is_blocked в drivers.
-- В SQL Editor Supabase выполни, если блокировка/разблокировка не работает.

ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_panel_read_drivers" ON public.drivers;
DROP POLICY IF EXISTS "admin_panel_update_drivers" ON public.drivers;

CREATE POLICY "admin_panel_read_drivers"
ON public.drivers
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "admin_panel_update_drivers"
ON public.drivers
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);
