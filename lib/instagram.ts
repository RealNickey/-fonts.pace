import { env } from '@/lib/env'

export async function uploadSlideToIG(imageUrl: string): Promise<string> {
  const igUserId = env.igUserId
  const accessToken = env.igAccessToken

  const params = new URLSearchParams({
    image_url: imageUrl,
    is_carousel_item: 'true',
    access_token: accessToken,
  })

  const res = await fetch(
    `https://graph.facebook.com/v19.0/${igUserId}/media`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
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

  const params = new URLSearchParams({
    media_type: 'CAROUSEL',
    children: childIds.join(','),
    caption,
    access_token: accessToken,
  })

  const res = await fetch(
    `https://graph.facebook.com/v19.0/${igUserId}/media`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    }
  )
  if (!res.ok) throw new Error(`IG carousel error: ${res.status} ${await res.text()}`)
  const data = await res.json()
  return data.id as string
}

export async function publishCarousel(containerId: string): Promise<string> {
  const igUserId = env.igUserId
  const accessToken = env.igAccessToken

  const params = new URLSearchParams({
    creation_id: containerId,
    access_token: accessToken,
  })

  const res = await fetch(
    `https://graph.facebook.com/v19.0/${igUserId}/media_publish`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    }
  )
  if (!res.ok) throw new Error(`IG publish error: ${res.status} ${await res.text()}`)
  const data = await res.json()
  return data.id as string
}
