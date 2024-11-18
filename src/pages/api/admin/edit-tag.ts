import type { APIRoute } from 'astro'
import { db } from '../../../lib/database'

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData()
    const tagId = formData.get('tagId') as string
    const tagName = (formData.get('tagName') as string).trim().toLowerCase()

    if (!tagId || !tagName) {
      return new Response(JSON.stringify({ error: 'Tag ID and name are required' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    await db.execute({
      sql: 'UPDATE tags SET name = ? WHERE id = ?',
      args: [tagName, tagId]
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
    console.error('Edit tag error:', error)
    return new Response(JSON.stringify({
      error: 'Failed to edit tag'
    }), { status: 500 })
  }
} 