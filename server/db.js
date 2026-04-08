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
  const connectionString = process.env.DATABASE_URL

  if (isRemote && connectionString) {
    try {
      const url = new URL(connectionString)
      const hostname = url.hostname
      const [ipv4] = await dns.resolve4(hostname)
      console.log(`DB host resolved to IPv4: ${ipv4}`)

      // Connect via IPv4 but keep original hostname as SSL servername (SNI)
      // so Supabase PgBouncer can identify the correct tenant
      return new Pool({
        host: ipv4,
        port: Number(url.port) || 5432,
        database: url.pathname.slice(1),
        user: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
        ssl: {
          rejectUnauthorized: false,
          servername: hostname,
        },
      })
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
