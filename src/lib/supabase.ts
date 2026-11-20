import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jybcdtsazulemlhrupwg.supabase.co";
const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_tsiz3skMyDQ3zJLKLD-MCg_pRTxwpSH";

export const MASTER_EMAIL = (
  process.env.NEXT_PUBLIC_MASTER_EMAIL || "bezerrosfarmaciabasica@gmail.com"
).toLowerCase();

export const supabase = createClient(url, key);
