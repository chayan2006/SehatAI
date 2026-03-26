import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function test() {
  console.log("Testing getInvoices...");
  const b = await supabase
    .from('billing_records')
    .select('*, patients(full_name)')
    .limit(1);

  if (b.error) {
    console.error("ERROR from billing_records:", b.error.message);
  } else {
    console.log("SUCCESS from billing_records:", b.data);
  }

  console.log("\nTesting getLabResults...");
  const l = await supabase
    .from('lab_results')
    .select('*, patients(full_name, external_id)')
    .limit(1);

  if (l.error) {
    console.error("ERROR from lab_results:", l.error.message);
  } else {
    console.log("SUCCESS from lab_results:", l.data);
  }
}

test();
