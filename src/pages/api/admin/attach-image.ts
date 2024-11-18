import type { APIRoute } from 'astro'
import { db } from '../../../lib/database'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import sharp from 'sharp'

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData()
    const storyId = formData.get('storyId') as string
    const image = formData.get('image') as File

    if (!storyId || !image) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadsDir, { recursive: true })

    // Generate unique filename
    const filename = `${Date.now()}-${image.name}`
    const filepath = join(uploadsDir, filename)

    // Process and optimize image
    const arrayBuffer = await image.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    await sharp(buffer)
      .resize(1200, 800, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .jpeg({ quality: 80 })
      .toFile(filepath)

    // Update database with image URL
    const imageUrl = `/uploads/${filename}`
    await db.execute({
      sql: 'UPDATE stories SET image_url = ? WHERE id = ?',
      args: [imageUrl, storyId]
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
    console.error('Image upload error:', error)
    return new Response(JSON.stringify({
      error: 'Failed to upload image'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 