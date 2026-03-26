import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function test() {
  const hospitalId = '11111111-1111-1111-1111-111111111111';
  const page = 0;
  const pageSize = 10;
  const from = page * pageSize;
  const to = from + pageSize - 1;

  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('hospital_id', hospitalId)
      .order('full_name', { ascending: true })
      .range(from, to);

    if (error) throw error;
    console.log("SUCCESS patients count:", data.length);
  } catch (err) {
    console.error("ERROR from exact getPatients:", err);
  }
}

test();
