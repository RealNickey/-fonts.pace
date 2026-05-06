import { NextRequest, NextResponse } from 'next/server'
import { head } from '@vercel/blob'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get('url')

  if (!url) {
    return new Response('Missing url', { status: 400 })
  }

  try {
    const blob = await head(url)
    
    // Fetch the actual blob content
    const response = await fetch(url)
    
    if (!response.ok) {
        return new Response('Failed to fetch blob', { status: response.status })
    }

    const headers = new Headers()
    headers.set('Content-Type', blob.contentType || 'image/png')
    headers.set('Cache-Control', 'public, max-age=31536000, immutable')

    return new NextResponse(response.body, {
      headers,
    })
  } catch (error) {
    console.error('Proxy error:', error)
    return new Response('Not found', { status: 404 })
  }
}
