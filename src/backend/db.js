import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Railway da ulanish uchun ssl: true kerak bo'lishi mumkin
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' || process.env.DATABASE_URL.includes('railway') ? { rejectUnauthorized: false } : false
});

export const query = (text, params) => pool.query(text, params);

export default pool;
