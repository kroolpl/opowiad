import { createClient } from '@libsql/client'
import bcrypt from 'bcryptjs'

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL || import.meta.env.DATABASE_URL
  // Ensure URL starts with libsql:// or file:
  if (!url.startsWith('libsql://') && !url.startsWith('file:')) {
    return `libsql://${url}`
  }
  return url
}

const client = createClient({
  url: getDatabaseUrl(),
  authToken: process.env.DATABASE_AUTH_TOKEN || import.meta.env.DATABASE_AUTH_TOKEN,
})

// Test the database connection
client.execute('SELECT 1')
  .then(() => console.log('Database connection successful'))
  .catch((error) => console.error('Database connection failed:', error))

export interface User {
  id: number
  username: string
  email: string
  password_hash: string
  avatar_url?: string
  bio?: string
  created_at: string
}

export interface Story {
  id: number
  title: string
  content: string
  author: string
  user_id: number
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  image_url?: string
  tags: string[]
}

export async function initializeDatabase() {
  // Drop existing tables
  await client.execute(`DROP TABLE IF EXISTS story_tags`)
  await client.execute(`DROP TABLE IF EXISTS tags`)
  await client.execute(`DROP TABLE IF EXISTS stories`)
  await client.execute(`DROP TABLE IF EXISTS users`)

  // Create users table
  await client.execute(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      avatar_url TEXT,
      bio TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create stories table with user_id
  await client.execute(`
    CREATE TABLE stories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      author TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  // Create other tables
  await client.execute(`
    CREATE TABLE tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    )
  `)

  await client.execute(`
    CREATE TABLE story_tags (
      story_id INTEGER,
      tag_id INTEGER,
      PRIMARY KEY (story_id, tag_id),
      FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    )
  `)

  // Create indexes
  await client.execute(`CREATE INDEX idx_stories_user_id ON stories(user_id)`)
  await client.execute(`CREATE INDEX idx_stories_status ON stories(status)`)
}

export const db = client 