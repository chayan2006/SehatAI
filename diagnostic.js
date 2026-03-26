import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  console.log("Checking Master Hospital...");
  const MASTER_HOSPITAL_ID = '11111111-1111-1111-1111-111111111111';
  const { data: mh, error: me } = await supabase.from('hospitals').select('*').eq('id', MASTER_HOSPITAL_ID);
  
  if (me) console.log("Hospitals Error:", me);
  else console.log("Master Hospital found:", mh?.length > 0 ? mh[0].hospital_name : 'No');

  console.log("Checking Triage Records for Master Hospital...");
  const { data: t, error: te } = await supabase.from('triage_records').select('*').eq('hospital_id', MASTER_HOSPITAL_ID);
  if (te) console.log("Triage Error:", te);
  else console.log("Triage records count:", t?.length);

  
}
run();
