import { DATABASE_URL } from '../configs/envConfig';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const connectionString = DATABASE_URL;
const pool = new Pool({ connectionString });
const db = drizzle(pool);

async function testConnection() {
  try {
    await pool.query('SELECT 1');
    console.log('✅ Postgres connection is working');
  } catch (error: any) {
    console.error('❌ Postgres connection failed:', error.message);
  }
}

testConnection();

export default db;
