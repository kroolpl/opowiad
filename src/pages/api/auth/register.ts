import type { APIRoute } from 'astro'
import { db } from '../../../lib/database'
import bcrypt from 'bcryptjs'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import sharp from 'sharp'

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData()
    const username = formData.get('username') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const bio = formData.get('bio') as string
    const avatar = formData.get('avatar') as File | null

    if (!username || !email || !password) {
      return new Response(JSON.stringify({
        error: 'Missing required fields'
      }), { status: 400 })
    }

    // Check if username or email already exists
    const existingUser = await db.execute({
      sql: 'SELECT id FROM users WHERE username = ? OR email = ?',
      args: [username, email]
    })

    if (existingUser.rows.length > 0) {
      return new Response(JSON.stringify({
        error: 'Username or email already exists'
      }), { status: 400 })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    let avatarUrl = null
    if (avatar && avatar.size > 0) {
      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'avatars')
      await mkdir(uploadsDir, { recursive: true })

      // Generate unique filename
      const filename = `${Date.now()}-${avatar.name}`
      const filepath = join(uploadsDir, filename)

      // Process and optimize avatar image
      const arrayBuffer = await avatar.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      
      await sharp(buffer)
        .resize(200, 200, { 
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 80 })
        .toFile(filepath)

      avatarUrl = `/uploads/avatars/${filename}`
    }

    // Insert user
    const result = await db.execute({
      sql: `
        INSERT INTO users (username, email, password_hash, bio, avatar_url)
        VALUES (?, ?, ?, ?, ?)
      `,
      args: [username, email, passwordHash, bio || null, avatarUrl]
    })

    const userId = Number(result.lastInsertRowid)

    // Set session cookie
    const token = await bcrypt.hash(userId.toString(), salt)
    const url = new URL(request.url)
    
    return new Response(null, {
      status: 302,
      headers: {
        'Location': `${url.protocol}//${url.host}/`,
        'Set-Cookie': `user_token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${60 * 60 * 24 * 7}` // 7 days
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    return new Response(JSON.stringify({
      error: 'Failed to register user'
    }), { status: 500 })
  }
} 