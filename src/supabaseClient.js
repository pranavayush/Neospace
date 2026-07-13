import { createClient } from "@supabase/supabase-js";

// === CONFIGURATION ===
// PASTE YOUR SUPABASE URL AND PUBLIC KEY (ANON KEY) HERE:
const SUPABASE_URL = "https://iufjokmsxixbmenkunts.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_0jv9hJVxm1clUrHZa33p_A_QZdvh5Dq";
// =====================

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);

