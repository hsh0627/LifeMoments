import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://cuslbbxrnzmfbuzvfoj.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1c2liYnhybnpudmZidXp2Zm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyOTQ4NDksImV4cCI6MjA5ODg3MDg0OX0.Qb02-gPnFxlpgKxJs07icyQV2i2awh4mnfRa3gXlDvM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
