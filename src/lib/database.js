/**
 * SehatAI Isomorphic Database Utility
 * Detects environment (Node vs Browser) and provides appropriate driver.
 */

const isBrowser = typeof window !== 'undefined';

let pool = null;

// Only initialize PostgreSQL in Node environment
if (!isBrowser) {
  import('pg').then(pkg => {
    const { Pool } = pkg.default;
    pool = new Pool({
      user: process.env.PGUSER || 'postgres',
      host: process.env.PGHOST || 'localhost',
      database: process.env.PGDATABASE || 'sehat_ai',
      password: process.env.PGPASSWORD || 'postgres',
      port: process.env.PGPORT || 5432,
    });
  }).catch(err => {
    console.error('PostgreSQL initialization failed:', err.message);
  });
}


/**
 * Executes a query against PostgreSQL (Node) or LocalStorage (Browser).
 */
export const query = async (text, params = []) => {
  if (!isBrowser && pool) {
    const start = Date.now();
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Executed Node-DB query', { text, duration, rows: res.rowCount });
      return res;
    } catch (err) {
      console.error('Node-DB query error', err);
      throw err;
    }
  }

  // Browser Fallback: LocalStorage Mock
  console.log('Executing Browser-Mock query:', text);
  
  // Simple Mock Logic for LocalStorage
  if (text.includes('SELECT * FROM patients')) {
    const mockPatients = [
      { id: '#PX-8812', name: 'Marcus Webb', age: 54, ward: 'ICU-A', status: 'Critical', last_active: new Date().toISOString() },
      { id: '#PX-9004', name: 'Priya Nair', age: 38, ward: 'ICU-B', status: 'Warning', last_active: new Date().toISOString() },
    ];
    return { rows: mockPatients, rowCount: mockPatients.length };
  }

  if (text.includes('SELECT count(*) FROM beds')) {
    return { rows: [{ count: '12' }], rowCount: 1 };
  }

  if (text.includes('SELECT count(*) FROM patients')) {
    return { rows: [{ count: '1284' }], rowCount: 1 };
  }

  return { rows: [], rowCount: 0 };
};

export const db = {
  getPatients: async () => {
    const res = await query('SELECT * FROM patients ORDER BY last_active DESC');
    return res.rows;
  },
  
  getPatientById: async (id) => {
    const res = await query('SELECT * FROM patients WHERE id = $1', [id]);
    return res.rows[0];
  },
  
  updatePatientStatus: async (id, status) => {
    return await query('UPDATE patients SET status = $1 WHERE id = $2', [status, id]);
  },

  getInventory: async (item) => {
    const res = await query('SELECT * FROM inventory WHERE item_name ILIKE $1', [`%${item}%`]);
    return res.rows;
  },

  getBedAvailability: async (ward) => {
    const res = await query('SELECT count(*) FROM beds WHERE ward = $1 AND status = \'Available\'', [ward]);
    return parseInt(res.rows[0]?.count || 0);
  },

  logAction: async (agent, action, details) => {
    return await query('INSERT INTO system_logs (agent_name, action, details) VALUES ($1, $2, $3)', [agent, action, details]);
  },
  
  getStats: async () => {
    const patients = await query('SELECT count(*) FROM patients');
    const emergencies = await query('SELECT count(*) FROM patients WHERE status = \'Critical\'');
    return {
      totalPatients: parseInt(patients.rows[0]?.count || 0),
      activeEmergencies: parseInt(emergencies.rows[0]?.count || 0),
      systemUptime: '99.9%'
    };
  }
};
