import type { APIRoute } from 'astro'
import { db } from '../../../lib/database'

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData()
    const tagName = (formData.get('tagName') as string).trim().toLowerCase()

    if (!tagName) {
      return new Response(JSON.stringify({ error: 'Tag name is required' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    await db.execute({
      sql: 'INSERT INTO tags (name) VALUES (?)',
      args: [tagName]
    })

    const url = new URL(request.url)
    const redirectUrl = `${url.protocol}//${url.host}/admin`
    
    return new Response(null, {
      status: 302,
      headers: {
        'Location': redirectUrl
      }
    })
  } catch (error) {
    console.error('Add tag error:', error)
    return new Response(JSON.stringify({
      error: 'Failed to add tag'
    }), { status: 500 })
  }
} 