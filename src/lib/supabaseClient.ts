import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "VITE_SUPABASE_URL e/o VITE_SUPABASE_ANON_KEY mancanti. Aggiungili al file .env e riavvia il server di sviluppo."
  );
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");
