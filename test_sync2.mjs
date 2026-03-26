import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function test() {
  console.log("Testing patients query...");
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .limit(1);

  if (error) {
    console.error("ERROR from patients:", error.message, error.details, error.code);
  } else {
    console.log("SUCCESS from patients. Data:", data);
  }

  console.log("\nTesting wards query...");
  const w = await supabase
    .from('wards')
    .select('*, beds(*, patients(*))')
    .limit(1);
  if (w.error) console.error("ERROR from wards:", w.error.message, w.error.details, w.error.code);
  else console.log("SUCCESS from wards. Data:", JSON.stringify(w.data, null, 2));
}

test();
