import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
  const { data, error } = await supabase.rpc('list_tables');
  
  if (error) {
    // If rpc doesn't exist, try querying common tables
    console.log("RPC 'list_tables' failed. Checking tables via queries...");
    const tables = [
      'profiles', 'hospitals', 'hospital_staff', 'patients', 'appointments', 
      'medical_records', 'subscriptions', 'audit_logs', 'record_attachments',
      'ai_chat_sessions', 'ai_chat_messages', 'domains', 'roadmaps', 'escalations',
      'pharmacy_inventory', 'billing_records', 'beds', 'wards', 'prescriptions'
    ];
    
    for (const table of tables) {
      const { error: tableError } = await supabase.from(table).select('*').limit(1);
      if (!tableError) {
        console.log(`Table EXISTS: ${table}`);
      } else if (tableError.code === '42P01') {
        console.log(`Table MISSING: ${table}`);
      } else {
        console.log(`Table ERROR (${table}): ${tableError.message}`);
      }
    }
  } else {
    console.log("Tables found:", data);
  }
}

listTables();
