import { createClient } from "@supabase/supabase-js";

export const ADMIN_EMAIL = "adeolakilanko77@gmail.com";
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder"
);
