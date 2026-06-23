import { env } from '@/lib/env'
import { getAccessToken } from '@/lib/token'
import { fetchFb } from '@/lib/fetch-fb'

// The correct base URL for the Instagram Graph API (Content Publishing API)
// graph.instagram.com was for the deprecated Basic Display API.
// Business/Creator accounts must use graph.facebook.com.
const IG_API_BASE = 'https://graph.facebook.com/v25.0'

async function getPageAccessToken(userToken: string, igUserId: string): Promise<string> {
  const r = await fetchFb(`https://graph.facebook.com/v25.0/me/accounts?fields=instagram_business_account,access_token&access_token=${userToken}`)
  const d = await r.json() as { data?: any[], error?: { message: string } }
  
  if (d.error) {
    throw new Error(`Facebook API Error: ${d.error.message}`)
  }
  
  const page = d.data?.find((p: any) => p.instagram_business_account?.id === igUserId)
  if (!page || !page.access_token) {
    throw new Error(`Failed to find linked Facebook Page Access Token for the Instagram Business Account (ID: ${igUserId}). Ensure the IG account is linked to a Facebook Page.`)
  }
  return page.access_token
}

export async function uploadSlideToIG(slideUrl: string): Promise<string> {
  const userToken = await getAccessToken()
  if (!userToken) throw new Error('Missing user token')
  if (!env.igUserId) throw new Error('Missing igUserId')
  const pageToken = await getPageAccessToken(userToken, env.igUserId)

  // 1. Create a container for this single slide (image or video)
  const res = await fetchFb(
    `https://graph.facebook.com/v25.0/${env.igUserId}/media`,
    {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${pageToken}`
      },
      body: JSON.stringify({
        image_url: slideUrl,
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
  const userToken = await getAccessToken()

  if (!igUserId || !userToken) {
    console.warn(`[DRY RUN] Skipping IG carousel creation, missing credentials`)
    return `dummy_carousel_${Math.random().toString(36).substring(7)}`
  }

  const pageToken = await getPageAccessToken(userToken, igUserId)

  const res = await fetchFb(
    `${IG_API_BASE}/${igUserId}/media`,
    {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${pageToken}`
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
  const userToken = await getAccessToken()

  if (!igUserId || !userToken) {
    console.warn(`[DRY RUN] Skipping IG carousel publish, missing credentials. Dummy container: ${containerId}`)
    return `dummy_publish_${Math.random().toString(36).substring(7)}`
  }

  const pageToken = await getPageAccessToken(userToken, igUserId)

  const res = await fetchFb(
    `${IG_API_BASE}/${igUserId}/media_publish`,
    {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${pageToken}`
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
