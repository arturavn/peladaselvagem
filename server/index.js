// server/index.js
// Express server entry point

import express from 'express'
import cors from 'cors'
import { initDb } from './db.js'
import router from './routes.js'
import { fileURLToPath } from 'url'
import path from 'path'

const app = express()
const PORT = process.env.PORT || 3001
const __dirname = path.dirname(fileURLToPath(import.meta.url))

app.use(cors())
app.use(express.json())
app.use('/api', router)

// Serve built frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')))
  app.get('/{*path}', (req, res) => res.sendFile(path.join(__dirname, '../dist/index.html')))
}

initDb().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
}).catch(err => {
  console.error('Failed to initialize database:', err)
  process.exit(1)
})
