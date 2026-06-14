-- Админ-панель обновляет status в reviews (new → reviewed).
-- В SQL Editor Supabase выполни, если кнопка «Рассмотреть» не меняет статус.

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_panel_read_reviews" ON public.reviews;
DROP POLICY IF EXISTS "admin_panel_update_reviews" ON public.reviews;

CREATE POLICY "admin_panel_read_reviews"
ON public.reviews
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "admin_panel_update_reviews"
ON public.reviews
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);
