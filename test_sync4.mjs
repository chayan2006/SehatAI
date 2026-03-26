import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function test() {
  try {
    console.log("Testing getLabResults...");
    const l = await supabase
      .from('lab_results')
      .select('*, patients(full_name, external_id)')
      .limit(1);

    if (l.error) {
      console.error("ERROR from lab_results:", l.error.message);
    } else {
      console.log("SUCCESS from lab_results", l.data);
    }
  } catch(e) {
    console.error("Crash:", e);
  }
}

test();
