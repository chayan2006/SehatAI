// src/database/dbClient.js
import pg from 'pg';

// RDS Connection Pool
const pool = new pg.Pool({
  host: import.meta.env.VITE_RDS_HOST,
  user: import.meta.env.VITE_RDS_USER,
  password: import.meta.env.VITE_RDS_PASSWORD,
  database: import.meta.env.VITE_RDS_DB_NAME,
  port: parseInt(import.meta.env.VITE_RDS_PORT || '5432'),
  ssl: {
    rejectUnauthorized: false // Required for RDS connectivity in most cases
  },
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const db = {
  /**
   * Execute a SQL query
   * @param {string} text - The SQL query
   * @param {any[]} params - The parameters for the query
   */
  async query(text, params) {
    const start = Date.now();
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Executed query', { text, duration, rows: res.rowCount });
      return res;
    } catch (error) {
      console.error('Error executing query', { text, error: error.message });
      throw error;
    }
  },

  /**
   * Get a client from the pool for transactions
   */
  async getClient() {
    const client = await pool.connect();
    const query = client.query;
    const release = client.release;
    
    // Set a timeout of 5 seconds to ensure we don't leak clients
    const timeout = setTimeout(() => {
      console.error('A client has been checked out for more than 5 seconds!');
      console.error('The last executed query on this client was: ', client.lastQuery);
    }, 5000);

    client.query = (...args) => {
      client.lastQuery = args;
      return query.apply(client, args);
    };

    client.release = () => {
      clearTimeout(timeout);
      client.query = query;
      client.release = release;
      return release.apply(client);
    };

    return client;
  }
};

export default db;
