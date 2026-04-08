// server/db.js
// PostgreSQL connection and state persistence

import pg from 'pg'
import dns from 'dns/promises'
import dotenv from 'dotenv'
import { DEFAULT_STATE } from './gameLogic.js'

dotenv.config()

const { Pool } = pg

const isRemote = process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost')

let pool

async function buildPool() {
  let connectionString = process.env.DATABASE_URL

  // Railway has no IPv6 route to Supabase — resolve hostname to IPv4 first
  if (isRemote && connectionString) {
    try {
      const url = new URL(connectionString)
      const [ipv4] = await dns.resolve4(url.hostname)
      url.hostname = ipv4
      connectionString = url.toString()
      console.log(`DB host resolved to IPv4: ${ipv4}`)
    } catch (e) {
      console.warn('IPv4 resolve failed, using original hostname:', e.message)
    }
  }

  return new Pool({
    connectionString,
    ssl: isRemote ? { rejectUnauthorized: false } : false,
  })
}

export async function initDb() {
  pool = await buildPool()
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
