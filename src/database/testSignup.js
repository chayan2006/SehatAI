import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; // Anon key is enough for signup
const supabase = createClient(supabaseUrl, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || supabaseKey);

async function testSignup() {
  console.log("Attempting direct signup test to grab the raw Postgres Error...");
  const randomEmail = `test_trigger_${Math.floor(Math.random() * 10000)}@debug.com`;

  const { data, error } = await supabase.auth.signUp({
    email: randomEmail,
    password: 'Password123!@#',
    options: {
      data: {
        role: 'patient',
        full_name: 'Trigger Debugger',
      }
    }
  });

  if (error) {
    console.error("\n[!] SIGNUP FAILED");
    console.error("Error Name:", error.name);
    console.error("Error Message:", error.message);
    console.error("Full Error Object:", JSON.stringify(error, null, 2));
  } else {
    console.log("\n[+] SIGNUP SUCCESS!");
    console.log("User Data:", JSON.stringify(data.user, null, 2));
    
    // Cleanup if successful
    if (process.env.VITE_SUPABASE_SERVICE_ROLE_KEY) {
       await supabase.auth.admin.deleteUser(data.user.id);
    }
  }
}

testSignup();
