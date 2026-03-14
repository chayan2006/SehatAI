import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://orhrvmazbczuvjrwccmr.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yaHJ2bWF6YmN6dXZqcndjY21yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzOTc3MzEsImV4cCI6MjA4ODk3MzczMX0.4JHa0ZDwEVZ72Aty1cY8iTBfBQ-27hxACfqJvqED-dQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function exportAllData() {
  try {
    console.log(`⏳ Connecting to Supabase Project: ${supabaseUrl}...`);
    
    // List of known tables in the project based on codebase analysis
    const tables = ['profiles', 'users', 'hospitals', 'domains', 'roadmaps', 'progress'];
    
    let outputContent = `--- 🗄️ Supabase Database Data Export ---\n`;
    outputContent += `Export Time: ${new Date().toISOString()}\n\n`;
    
    // Also try to get Auth Users if we have Service Role Key (Admin privileges)
    // For standard anon key, this might fail, which is expected.
    outputContent += `=== AUTHENTICATED USERS ===\n`;
    const { data: authUsers, error: authError } = await supabase.auth.admin?.listUsers() || { data: { users: [] }, error: new Error('Admin API not available with anon key') };
    
    if (authError) {
       outputContent += `[Cannot fetch auth users with current API key - requires Service Role key]\n`;
    } else if (authUsers && authUsers.users) {
       outputContent += `Total Users: ${authUsers.users.length}\n`;
       authUsers.users.forEach((u, i) => {
          outputContent += `${i+1}. Email: ${u.email} | ID: ${u.id} | Created: ${u.created_at}\n`;
          if (u.user_metadata) {
            outputContent += `   Metadata: ${JSON.stringify(u.user_metadata)}\n`;
          }
       });
    }
    outputContent += `\n`;

    // Fetch data for each table
    for (const table of tables) {
      outputContent += `=== TABLE: ${table.toUpperCase()} ===\n`;
      
      const { data, error } = await supabase.from(table).select('*').limit(100);
      
      if (error) {
        if (error.code === 'PGRST205') {
          outputContent += `[Table does not exist or is not exposed via API]\n\n`;
        } else {
           outputContent += `[Error fetching data: ${error.message}]\n\n`;
        }
      } else if (!data || data.length === 0) {
        outputContent += `[Table is empty]\n\n`;
      } else {
        outputContent += `Total Rows: ${data.length}\n`;
        data.forEach((row, index) => {
          outputContent += `Row ${index + 1}:\n`;
          outputContent += JSON.stringify(row, null, 2).split('\n').map(line => `  ${line}`).join('\n') + '\n';
        });
        outputContent += `\n`;
      }
    }

    // Write to a file in the same directory
    const filePath = path.join(__dirname, 'all_database_data.txt');
    fs.writeFileSync(filePath, outputContent);
    
    console.log(`✅ Successfully fetched database data!`);
    console.log(`\n💾 Saved database data to: ${filePath}`);
    console.log(`Open that file in your editor to view all users, profiles, and other table data.`);

  } catch (error) {
    console.error("❌ Error fetching data:");
    console.error(error.message);
  }
}

// Execute the function
exportAllData();
