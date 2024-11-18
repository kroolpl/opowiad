import type { APIRoute } from 'astro'
import { db } from '../../../lib/database'
import { unlink } from 'fs/promises'
import { join } from 'path'

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData()
    const storyId = formData.get('storyId')

    const result = await db.execute({
      sql: 'SELECT image_url FROM stories WHERE id = ?',
      args: [storyId]
    })

    const imageUrl = result.rows[0]?.image_url
    if (imageUrl && typeof imageUrl === 'string') {
      const filepath = join(process.cwd(), 'public', imageUrl)
      await unlink(filepath).catch(() => {
        // Ignore errors if file doesn't exist
      })
    }

    await db.execute({
      sql: 'UPDATE stories SET image_url = NULL WHERE id = ?',
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
    console.error('Image removal error:', error)
    return new Response(JSON.stringify({
      error: 'Failed to remove image'
    }), { status: 500 })
  }
} 