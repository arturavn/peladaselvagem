// server/db.js
// PostgreSQL connection and state persistence

import pg from 'pg'
import dotenv from 'dotenv'
import { DEFAULT_STATE } from './gameLogic.js'

dotenv.config()

const { Pool } = pg

const isRemote = process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isRemote ? { rejectUnauthorized: false } : false,
  family: 4, // force IPv4
})

export async function query(text, params) {
  return pool.query(text, params)
}

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pelada_state (
      id INTEGER PRIMARY KEY DEFAULT 1,
      state JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    INSERT INTO pelada_state (id, state) VALUES (1, '{}') ON CONFLICT DO NOTHING;
  `)
  console.log('Database initialized')
}

export async function getState() {
  const result = await pool.query('SELECT state FROM pelada_state WHERE id = 1')
  if (result.rows.length === 0) {
    return { ...DEFAULT_STATE }
  }
  const stored = result.rows[0].state
  // Merge with DEFAULT_STATE so any new keys are always present
  return { ...DEFAULT_STATE, ...stored }
}

export async function saveState(state) {
  await pool.query(
    `INSERT INTO pelada_state (id, state, updated_at)
     VALUES (1, $1, NOW())
     ON CONFLICT (id) DO UPDATE SET state = $1, updated_at = NOW()`,
    [JSON.stringify(state)]
  )
  return state
}
