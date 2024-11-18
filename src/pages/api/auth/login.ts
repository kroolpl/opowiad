import type { APIRoute } from 'astro'
import { db } from '../../../lib/database'
import bcrypt from 'bcryptjs'

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
      return new Response(JSON.stringify({
        error: 'Missing required fields'
      }), { status: 400 })
    }

    // Get user
    const result = await db.execute({
      sql: 'SELECT id, password_hash FROM users WHERE email = ?',
      args: [email]
    })

    const user = result.rows[0]
    if (!user) {
      return new Response(null, {
        status: 302,
        headers: {
          'Location': '/login?error=true'
        }
      })
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, String(user.password_hash))
    if (!validPassword) {
      return new Response(null, {
        status: 302,
        headers: {
          'Location': '/login?error=true'
        }
      })
    }

    // Set session cookie
    const salt = await bcrypt.genSalt(10)
    const token = await bcrypt.hash(user.id.toString(), salt)
    const url = new URL(request.url)
    
    return new Response(null, {
      status: 302,
      headers: {
        'Location': `${url.protocol}//${url.host}/`,
        'Set-Cookie': `user_token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${60 * 60 * 24 * 7}` // 7 days
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return new Response(JSON.stringify({
      error: 'Failed to process login'
    }), { status: 500 })
  }
} 