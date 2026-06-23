/**
 * lib/token.ts
 *
 * Instagram Graph API token management.
 *
 * Strategy:
 *  1. The active token is stored in Upstash KV under `ig:access_token`.
 *  2. Its expiry epoch (seconds) is stored under `ig:token_expires_at`.
 *  3. On every read, if the token will expire within REFRESH_THRESHOLD_DAYS
 *     (default 10 days), we proactively call the Facebook refresh endpoint
 *     and persist the new token + expiry back to KV.
 *  4. If KV has no token yet, we seed it from IG_ACCESS_TOKEN in env.
 *
 * This means the pipeline never goes down as long as it runs at least once
 * every 50 days (within the 60-day window minus the 10-day threshold).
 * The daily cron takes care of that automatically.
 *
 * Requirements in .env.local / Vercel env vars:
 *   IG_ACCESS_TOKEN    – The initial long-lived (60-day) token
 *   IG_USER_ID         – Your Instagram Business User ID
 *   FB_APP_ID          – Your Meta App ID  (for token refresh)
 *   FB_APP_SECRET      – Your Meta App Secret (for token refresh)
 */

import { kv } from '@/lib/kv'
import { env } from '@/lib/env'
import { fetchFb } from '@/lib/fetch-fb'

const KV_TOKEN_KEY = 'ig:access_token_v3'
const KV_EXPIRES_KEY = 'ig:token_expires_at_v3'
const REFRESH_THRESHOLD_DAYS = 10 // refresh when fewer than 10 days remain
const SECONDS_PER_DAY = 86400

/**
 * Returns the current valid access token.
 * Proactively refreshes if it is close to expiring.
 * Falls back to IG_ACCESS_TOKEN env var if KV is empty.
 */
export async function getAccessToken(): Promise<string | undefined> {
  try {
    let token = await kv.get<string>(KV_TOKEN_KEY)
    const expiresAt = await kv.get<number>(KV_EXPIRES_KEY)

    // Seed KV from env if nothing stored yet
    if (!token) {
      token = env.igAccessToken || null
      if (token) {
        // We don't know the exact expiry of the seeded token, so assume ~55 days
        // from now (conservative; user should ideally refresh as soon as possible).
        const assumedExpiry = Math.floor(Date.now() / 1000) + 55 * SECONDS_PER_DAY
        await kv.set(KV_TOKEN_KEY, token)
        await kv.set(KV_EXPIRES_KEY, assumedExpiry)
        console.log('[token] Seeded token from env into KV. Assumed expiry in ~55 days.')
      }
      return token ?? undefined
    }

    // Check if we should proactively refresh
    const nowSeconds = Math.floor(Date.now() / 1000)
    const daysRemaining = expiresAt
      ? Math.floor((expiresAt - nowSeconds) / SECONDS_PER_DAY)
      : 0

    if (daysRemaining <= REFRESH_THRESHOLD_DAYS) {
      console.log(`[token] Token expires in ${daysRemaining} days — refreshing now...`)
      const refreshed = await refreshToken(token)
      if (refreshed) {
        return refreshed
      }
      console.warn('[token] Refresh failed — using existing token as fallback.')
    }

    return token
  } catch (err) {
    console.error('[token] KV error, falling back to env token:', err)
    return env.igAccessToken ?? undefined
  }
}

/**
 * Forces a token refresh regardless of expiry.
 * Returns the new token string, or null on failure.
 *
 * Uses the Facebook Graph API long-lived token refresh endpoint:
 * GET /oauth/access_token?grant_type=fb_exchange_token&...
 */
export async function refreshToken(currentToken: string): Promise<string | null> {
  const appId = env.fbAppId
  const appSecret = env.fbAppSecret

  if (!appId || !appSecret) {
    console.warn('[token] FB_APP_ID or FB_APP_SECRET not set — cannot refresh token.')
    return null
  }

  try {
    const url = new URL('https://graph.facebook.com/v25.0/oauth/access_token')
    url.searchParams.set('grant_type', 'fb_exchange_token')
    url.searchParams.set('client_id', appId)
    url.searchParams.set('client_secret', appSecret)
    url.searchParams.set('fb_exchange_token', currentToken)

    const res = await fetchFb(url.toString())
    const data = await res.json() as {
      access_token?: string
      expires_in?: number
      error?: { message: string }
    }

    if (!res.ok || data.error) {
      console.error('[token] Refresh API error:', data.error?.message ?? `HTTP ${res.status}`)
      return null
    }

    const newToken = data.access_token!
    // expires_in is in seconds from now
    const expiresAt = Math.floor(Date.now() / 1000) + (data.expires_in ?? 60 * SECONDS_PER_DAY)
    const daysUntilExpiry = Math.floor((data.expires_in ?? 0) / SECONDS_PER_DAY)

    await kv.set(KV_TOKEN_KEY, newToken)
    await kv.set(KV_EXPIRES_KEY, expiresAt)

    console.log(`[token] Token refreshed successfully. Expires in ~${daysUntilExpiry} days.`)
    return newToken
  } catch (err) {
    console.error('[token] Network error during refresh:', err)
    return null
  }
}

/**
 * Returns token metadata for health-check/dashboard purposes.
 */
export async function getTokenInfo(): Promise<{
  hasToken: boolean
  expiresAt: Date | null
  daysRemaining: number | null
  source: 'kv' | 'env' | 'none'
}> {
  try {
    const token = await kv.get<string>(KV_TOKEN_KEY)
    const expiresAt = await kv.get<number>(KV_EXPIRES_KEY)

    if (token && expiresAt) {
      const nowSeconds = Math.floor(Date.now() / 1000)
      const daysRemaining = Math.floor((expiresAt - nowSeconds) / SECONDS_PER_DAY)
      return {
        hasToken: true,
        expiresAt: new Date(expiresAt * 1000),
        daysRemaining,
        source: 'kv',
      }
    }

    const envToken = env.igAccessToken
    return {
      hasToken: !!envToken,
      expiresAt: null,
      daysRemaining: null,
      source: envToken ? 'env' : 'none',
    }
  } catch {
    return { hasToken: false, expiresAt: null, daysRemaining: null, source: 'none' }
  }
}
