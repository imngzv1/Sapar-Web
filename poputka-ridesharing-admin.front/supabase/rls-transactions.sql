-- Админ-панель читает transactions через anon/publishable key (supabase.ts).
-- В SQL Editor Supabase выполни этот скрипт, если в таблице есть строки,
-- а на фронте «Транзакций пока нет».

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_panel_read_transactions" ON public.transactions;

CREATE POLICY "admin_panel_read_transactions"
ON public.transactions
FOR SELECT
TO anon, authenticated
USING (true);
