import type { APIRoute } from 'astro'
import { db } from '../../../lib/database'

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData()
    const storyId = String(formData.get('storyId'))

    if (!storyId) {
      return new Response(JSON.stringify({ error: 'Story ID is required' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    await db.execute({
      sql: 'UPDATE stories SET status = "approved" WHERE id = ?',
      args: [storyId]
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
    console.error('Approve error:', error)
    return new Response(JSON.stringify({
      error: 'Failed to approve story'
    }), { status: 500 })
  }
} 