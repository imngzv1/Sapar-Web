import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hhdkamwvfnlevfwasgtu.supabase.co';
const supabaseKey = 'sb_publishable_zNlXjoRLjAbpyVJk4YKRbQ_VvmfH2dv';

export const supabase = createClient(supabaseUrl, supabaseKey);
