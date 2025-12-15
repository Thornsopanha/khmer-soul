import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://aaupbyzfhtrabiygujuz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhdXBieXpmaHRyYWJpeWd1anV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NDE3NDIsImV4cCI6MjA4MTIxNzc0Mn0.Vknu-hVrILiKFsTt88UhO12iTnsSvFjtkLlldq08BOo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);