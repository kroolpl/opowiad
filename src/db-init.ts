import 'dotenv/config'
import { initializeDatabase } from './lib/database'

// Initialize the database
initializeDatabase()
  .then(() => console.log('Database initialized successfully'))
  .catch((error) => console.error('Failed to initialize database:', error)) 