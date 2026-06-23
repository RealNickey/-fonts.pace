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
    const originalEnvToken = await kv.get<string>('ig:original_env_token')
    const nowSeconds = Math.floor(Date.now() / 1000)

    if (env.igAccessToken && env.igAccessToken !== originalEnvToken) {
      console.log('[token] IG_ACCESS_TOKEN in env has changed. Validating and seeding new token...')
      token = env.igAccessToken
      
      try {
        const r = await fetchFb(`https://graph.facebook.com/debug_token?input_token=${token}&access_token=${env.fbAppId}|${env.fbAppSecret}`)
        const d = await r.json()
        if (d.data && d.data.is_valid) {
          const exp = d.data.expires_at
          let actualExpiry = nowSeconds + 55 * SECONDS_PER_DAY
          if (exp > 0) {
            actualExpiry = exp
          }
          await kv.set(KV_TOKEN_KEY, token)
          await kv.set(KV_EXPIRES_KEY, actualExpiry)
          await kv.set('ig:original_env_token', token)
          console.log(`[token] Seeded new token from env. Expires at: ${new Date(actualExpiry * 1000).toISOString()}`)
          return token
        } else {
          console.error('[token] The new token in env is invalid or expired:', d.data?.error?.message || d.error?.message)
          // We still set original_env_token so we don't spam the API on every request
          await kv.set('ig:original_env_token', token)
          return undefined
        }
      } catch (e) {
        console.error('[token] Failed to validate new env token:', e)
        return undefined
      }
    }

    // Seed KV from env if nothing stored yet (and originalEnvToken wasn't set)
    if (!token && env.igAccessToken) {
      token = env.igAccessToken
      try {
        const r = await fetchFb(`https://graph.facebook.com/debug_token?input_token=${token}&access_token=${env.fbAppId}|${env.fbAppSecret}`)
        const d = await r.json()
        if (d.data && d.data.is_valid) {
          const exp = d.data.expires_at
          let actualExpiry = nowSeconds + 55 * SECONDS_PER_DAY
          if (exp > 0) actualExpiry = exp
          
          await kv.set(KV_TOKEN_KEY, token)
          await kv.set(KV_EXPIRES_KEY, actualExpiry)
          await kv.set('ig:original_env_token', token)
          console.log(`[token] Initial seed from env into KV. Expires at: ${new Date(actualExpiry * 1000).toISOString()}`)
          return token
        } else {
          console.error('[token] The initial token in env is invalid or expired:', d.data?.error?.message || d.error?.message)
          await kv.set('ig:original_env_token', token)
          return undefined
        }
      } catch (e) {
        console.error('[token] Failed to validate initial env token:', e)
        return undefined
      }
    }

    // Check if we should proactively refresh
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
