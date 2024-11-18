import type { APIRoute } from 'astro'
import { db } from '../../../lib/database'
import { unlink } from 'fs/promises'
import { join } from 'path'

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData()
    const storyId = formData.get('storyId') as string

    // Get current image URL
    const result = await db.execute({
      sql: 'SELECT image_url FROM stories WHERE id = ?',
      args: [storyId]
    })

    const imageUrl = result.rows[0]?.image_url
    if (imageUrl) {
      // Remove file from disk
      const filepath = join(process.cwd(), 'public', imageUrl)
      await unlink(filepath).catch(() => {
        // Ignore errors if file doesn't exist
      })
    }

    // Update database to remove image URL
    await db.execute({
      sql: 'UPDATE stories SET image_url = NULL WHERE id = ?',
      args: [storyId]
    })

    // Redirect back to admin page
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
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 