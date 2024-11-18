import type { APIRoute } from 'astro'

export const POST: APIRoute = async ({ cookies }) => {
  cookies.delete('admin_token', { path: '/' })
  
  return new Response(null, {
    status: 302,
    headers: {
      'Location': '/admin/login'
    }
  })
} 