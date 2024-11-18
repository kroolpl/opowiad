import type { APIRoute } from 'astro'
import { createHash } from 'crypto'

// In a real app, use environment variables for these values
const ADMIN_PASSWORD = 'admin123' // Change this to a secure password
const TOKEN_SECRET = 'your-secret-key' // Change this to a secure secret

function generateToken(password: string): string {
  return createHash('sha256')
    .update(password + TOKEN_SECRET)
    .digest('hex')
}

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const formData = await request.formData()
    const password = formData.get('password') as string

    if (password === ADMIN_PASSWORD) {
      // Set admin token cookie
      const token = generateToken(password)
      cookies.set('admin_token', token, {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 // 24 hours
      })

      return new Response(null, {
        status: 302,
        headers: {
          'Location': '/admin'
        }
      })
    }

    return new Response(null, {
      status: 302,
      headers: {
        'Location': '/admin/login?error=true'
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return new Response(JSON.stringify({
      error: 'Failed to process login'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 