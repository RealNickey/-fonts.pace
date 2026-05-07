import { env } from '@/lib/env'
import dns from 'node:dns'

// Fix Node.js fetch ConnectTimeoutError to graph.facebook.com over IPv6
dns.setDefaultResultOrder('ipv4first')

export async function uploadSlideToIG(imageUrl: string): Promise<string> {
  const igUserId = env.igUserId
  const accessToken = env.igAccessToken

  if (!igUserId || !accessToken) {
    console.warn(`[DRY RUN] Skipping IG slide upload, missing credentials: ${imageUrl}`)
    return `dummy_slide_${Math.random().toString(36).substring(7)}`
  }

  const res = await fetch(
    `https://graph.instagram.com/v25.0/${igUserId}/media`,
    {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        image_url: imageUrl,
        is_carousel_item: true
      }),
    }
  )
  if (!res.ok) throw new Error(`IG upload error: ${res.status} ${await res.text()}`)
  const data = await res.json()
  return data.id as string
}

export async function createCarousel(
  childIds: string[],
  caption: string
): Promise<string> {
  const igUserId = env.igUserId
  const accessToken = env.igAccessToken

  if (!igUserId || !accessToken) {
    console.warn(`[DRY RUN] Skipping IG carousel creation, missing credentials`)
    return `dummy_carousel_${Math.random().toString(36).substring(7)}`
  }

  const res = await fetch(
    `https://graph.instagram.com/v25.0/${igUserId}/media`,
    {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        media_type: 'CAROUSEL',
        children: childIds.join(','),
        caption
      }),
    }
  )
  if (!res.ok) throw new Error(`IG carousel error: ${res.status} ${await res.text()}`)
  const data = await res.json()
  return data.id as string
}

export async function publishCarousel(containerId: string): Promise<string> {
  const igUserId = env.igUserId
  const accessToken = env.igAccessToken

  if (!igUserId || !accessToken) {
    console.warn(`[DRY RUN] Skipping IG carousel publish, missing credentials. Dummy container: ${containerId}`)
    return `dummy_publish_${Math.random().toString(36).substring(7)}`
  }

  const res = await fetch(
    `https://graph.instagram.com/v25.0/${igUserId}/media_publish`,
    {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        creation_id: containerId
      }),
    }
  )
  if (!res.ok) throw new Error(`IG publish error: ${res.status} ${await res.text()}`)
  const data = await res.json()
  return data.id as string
}
