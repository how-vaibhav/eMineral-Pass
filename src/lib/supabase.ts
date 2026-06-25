import { Database } from "@/types/database";
import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function createMissingSupabaseClient(clientName: string) {
  return new Proxy(
    {},
    {
      get() {
        throw new Error(
          `Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY before using ${clientName}.`,
        );
      },
      apply() {
        throw new Error(
          `Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY before using ${clientName}.`,
        );
      },
    },
  ) as never;
}

const globalForSupabase = globalThis as typeof globalThis & {
  __emineralSupabase?: ReturnType<typeof createBrowserClient<Database>>;
};

// Client-side Supabase client (anon key)
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? (globalForSupabase.__emineralSupabase ??= createBrowserClient<Database>(
        supabaseUrl,
        supabaseAnonKey,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
          },
        },
      ))
    : createMissingSupabaseClient("supabase");

// Server-side Supabase client (service role key)
// Only use this in API routes and server actions
export const supabaseAdmin =
  supabaseUrl && supabaseAnonKey
    ? createClient<Database>(
        supabaseUrl,
        supabaseServiceRoleKey || supabaseAnonKey,
        {
          auth: {
            persistSession: false,
          },
        },
      )
    : createMissingSupabaseClient("supabaseAdmin");
