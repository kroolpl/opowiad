import type { APIRoute } from 'astro'
import { db } from '../../lib/database'

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData()
    const title = formData.get('title') as string
    const author = formData.get('author') as string
    const content = formData.get('content') as string
    const existingTags = formData.getAll('tags').map(tag => Number(tag))
    const newTags = (formData.get('newTags') as string || '')
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)

    if (!title || !author || !content) {
      return new Response(JSON.stringify({
        error: 'Missing required fields'
      }), { status: 400 })
    }

    // Insert story first
    const storyResult = await db.execute({
      sql: 'INSERT INTO stories (title, author, content) VALUES (?, ?, ?)',
      args: [title, author, content]
    })
    const storyId = Number(storyResult.lastInsertRowid)

    // Process tags
    const tagIds = [...existingTags]
    for (const tagName of newTags) {
      // Try to insert new tag
      await db.execute({
        sql: 'INSERT OR IGNORE INTO tags (name) VALUES (?)',
        args: [tagName.toLowerCase()]
      })
      
      // Get the tag ID (whether it was just inserted or already existed)
      const result = await db.execute({
        sql: 'SELECT id FROM tags WHERE name = ?',
        args: [tagName.toLowerCase()]
      })
      if (result.rows[0]) {
        tagIds.push(Number(result.rows[0].id))
      }
    }

    // Link tags to story
    for (const tagId of tagIds) {
      await db.execute({
        sql: 'INSERT INTO story_tags (story_id, tag_id) VALUES (?, ?)',
        args: [storyId, tagId]
      })
    }

    const url = new URL(request.url)
    const redirectUrl = `${url.protocol}//${url.host}/?submitted=true`
    
    return new Response(null, {
      status: 302,
      headers: {
        'Location': redirectUrl
      }
    })
  } catch (error) {
    console.error('Submit error:', error)
    return new Response(JSON.stringify({
      error: 'Failed to submit story'
    }), { status: 500 })
  }
} 