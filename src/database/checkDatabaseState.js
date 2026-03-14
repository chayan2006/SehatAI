import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') }); // Ensure we find the env file

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseState() {
  console.log("Verifying if the new Enterprise SQL schema is active...");
  
  // Try to query a table that was ONLY added in the new enterprise schema
  const { error } = await supabase.from('ai_chat_messages').select('*').limit(1);
  
  if (error && error.code === '42P01') {
    console.log("RESULT: FAILED! The 'ai_chat_messages' table does not exist.");
    console.log("This means the user has NOT executed the new SQL file in their Supabase Dashboard.");
  } else if (error) {
    console.log("RESULT: ERROR", error.message);
  } else {
    console.log("RESULT: SUCCESS! The enterprise tables exist.");
  }
}

checkDatabaseState();
