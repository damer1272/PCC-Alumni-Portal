import { createClient } from "@supabase/supabase-js";

// Default Supabase project credentials for PCC Alumni Portal live database
const DEFAULT_SUPABASE_URL = "https://olyddhyhrbqzovlrnojn.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9seWRkaHlocmJxem92bHJub2puIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3MDgxOTEsImV4cCI6MjEwNjI4NDE5MX0.39Sy6FCyvKYuVUyxzfSZ4gmdZDs3QqUp0NpLeBSRPq0";

// Read Supabase credentials from Vite environment variables or fallback defaults
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      supabaseUrl !== "https://your-supabase-project-ref.supabase.co" &&
      !supabaseUrl.includes("your-supabase-project-ref")
  );
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
