import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables if needed
dotenv.config();

// Usually "Tier 1 database" refers to your primary development database.
// Replace this with your PostgreSQL connection URI.
// For example: postgresql://postgres:123456@localhost:5432/postgres
const connectionString = 
  process.env.VITE_SUPABASE_DB_URL || 
  process.env.DATABASE_URL || 
  "postgresql://postgres:123456@localhost:5432/postgres";

const client = new Client({
  connectionString,
});

async function listDatabases() {
  try {
    console.log(`⏳ Connecting to PostgreSQL using connection string: ${connectionString.split('@')[1] || 'local'}...`);
    await client.connect();
    console.log("✅ Successfully connected to PostgreSQL.\n");

    // Query to list all databases in PostgreSQL, filtering out templates
    const res = await client.query('SELECT datname FROM pg_database WHERE datistemplate = false;');
    
    let outputContent = "--- 🗄️ List of Databases ---\n";
    res.rows.forEach((row, index) => {
      outputContent += `${index + 1}. ${row.datname}\n`;
    });
    outputContent += "-----------------------------\n";

    // Write to a file in the same directory
    const filePath = path.join(__dirname, 'databases_list.txt');
    fs.writeFileSync(filePath, outputContent);
    
    console.log(outputContent);
    console.log(`\n💾 Saved database list to: ${filePath}`);

  } catch (error) {
    console.error("❌ Error connecting to or querying the database:");
    console.error(error.message);
    console.log("\nMake sure your connection string is correct and the PostgreSQL server is running!");
  } finally {
    await client.end();
    console.log("🔌 Connection closed.");
  }
}

// Execute the function
listDatabases();
