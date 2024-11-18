import type { APIRoute } from 'astro'
import { db } from '../../../lib/database'

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData()
    const tagId = formData.get('tagId') as string

    if (!tagId) {
      return new Response(JSON.stringify({ error: 'Tag ID is required' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    await db.execute('BEGIN TRANSACTION')

    try {
      // Remove tag from all stories first
      await db.execute({
        sql: 'DELETE FROM story_tags WHERE tag_id = ?',
        args: [tagId]
      })

      // Then delete the tag
      await db.execute({
        sql: 'DELETE FROM tags WHERE id = ?',
        args: [tagId]
      })

      await db.execute('COMMIT')
    } catch (error) {
      await db.execute('ROLLBACK')
      throw error
    }

    const url = new URL(request.url)
    const redirectUrl = `${url.protocol}//${url.host}/admin`
    
    return new Response(null, {
      status: 302,
      headers: {
        'Location': redirectUrl
      }
    })
  } catch (error) {
    console.error('Delete tag error:', error)
    return new Response(JSON.stringify({
      error: 'Failed to delete tag'
    }), { status: 500 })
  }
} 