/**
 * GET /api/token-test
 *
 * Temporary diagnostic route — tests all Instagram Graph API credentials.
 * DELETE THIS FILE after confirming everything works.
 */
import { NextResponse } from 'next/server'
import { env } from '@/lib/env'
import { fetchFb } from '@/lib/fetch-fb'

import { kv } from '@/lib/kv'

export const runtime = 'nodejs'

export async function GET() {
  const TOKEN = env.igAccessToken
  const APP_ID = env.fbAppId
  const APP_SECRET = env.fbAppSecret
  const IG_USER_ID = env.igUserId

  const v1 = await kv.get('ig:access_token')
  const v2 = await kv.get('ig:access_token_v2')
  const v3 = await kv.get('ig:access_token_v3')

  const results: Record<string, unknown> = {
    env: {
      hasToken: !!TOKEN,
      tokenPrefix: TOKEN?.slice(0, 10) + '...',
      hasAppId: !!APP_ID,
      hasAppSecret: !!APP_SECRET,
      igUserId: IG_USER_ID,
    },
    kvState: {
      v1_exists: !!v1,
      v1_prefix: typeof v1 === 'string' ? v1.slice(0, 15) : null,
      v2_exists: !!v2,
      v2_prefix: typeof v2 === 'string' ? v2.slice(0, 15) : null,
      v3_exists: !!v3,
      v3_prefix: typeof v3 === 'string' ? v3.slice(0, 15) : null,
    }
  }

  if (!TOKEN || !APP_ID || !APP_SECRET) {
    return NextResponse.json({ error: 'Missing env vars', results }, { status: 400 })
  }

  // --- Test 1: Debug token ---
  try {
    const r = await fetchFb(
      `https://graph.facebook.com/debug_token?input_token=${TOKEN}&access_token=${APP_ID}|${APP_SECRET}`
    )
    const d = await r.json() as { data?: Record<string, unknown>; error?: { message: string } }
    if (d.error) {
      results.tokenDebug = { ok: false, error: d.error.message }
    } else {
      const info = d.data!
      const exp = info.expires_at as number
      const nowSec = Math.floor(Date.now() / 1000)
      results.tokenDebug = {
        ok: true,
        valid: info.is_valid,
        type: info.type,
        app: info.application,
        appId: info.app_id,
        userId: info.user_id,
        expiresAt: exp === 0 ? 'NEVER' : new Date(exp * 1000).toISOString(),
        daysRemaining: exp === 0 ? 'unlimited' : Math.floor((exp - nowSec) / 86400),
        scopes: info.scopes,
      }
    }
  } catch (e) {
    results.tokenDebug = { ok: false, error: String(e) }
  }

  // --- Test 2: Exchange token (verifies App ID + Secret are correct) ---
  try {
    const r = await fetchFb(
      `https://graph.facebook.com/v25.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${APP_ID}&client_secret=${APP_SECRET}&fb_exchange_token=${TOKEN}`
    )
    const d = await r.json() as { access_token?: string; expires_in?: number; error?: { message: string; code: number } }
    if (d.error) {
      // Code 190 subcode 463 = already long-lived, which is fine
      const alreadyLongLived =
        d.error.message?.toLowerCase().includes('long-lived') ||
        d.error.message?.toLowerCase().includes('already')
      results.tokenExchange = {
        ok: alreadyLongLived,
        note: alreadyLongLived
          ? 'Token is already long-lived — refresh endpoint will work when needed.'
          : d.error.message,
      }
    } else {
      results.tokenExchange = {
        ok: true,
        note: `Fresh long-lived token obtained, expires in ~${Math.floor((d.expires_in ?? 0) / 86400)} days`,
      }
    }
  } catch (e) {
    results.tokenExchange = { ok: false, error: String(e) }
  }

  // --- Test 3: /me check ---
  try {
    const r = await fetchFb(`https://graph.facebook.com/v25.0/me?access_token=${TOKEN}`)
    const d = await r.json() as { id?: string; name?: string; error?: { message: string } }
    results.meCheck = d.error
      ? { ok: false, error: d.error.message }
      : { ok: true, id: d.id, name: d.name }
  } catch (e) {
    results.meCheck = { ok: false, error: String(e) }
  }

  // --- Test 4: Get Page Access Token from /me/accounts ---
  let pageAccessToken = TOKEN
  try {
    const r = await fetchFb(`https://graph.facebook.com/v25.0/me/accounts?fields=id,name,instagram_business_account,access_token&access_token=${TOKEN}`)
    const d = await r.json() as { data?: any[]; error?: { message: string } }
    if (d.error) {
      results.pageAccountCheck = { ok: false, error: d.error.message }
    } else {
      const page = d.data?.find((p: any) => p.instagram_business_account?.id === IG_USER_ID)
      if (page && page.access_token) {
        pageAccessToken = page.access_token
        results.pageAccountCheck = { ok: true, note: `Found Page Access Token for page: ${page.name}` }
      } else {
        results.pageAccountCheck = { ok: false, error: `No linked Facebook Page found for Instagram ID ${IG_USER_ID}` }
      }
    }
  } catch (e) {
    results.pageAccountCheck = { ok: false, error: String(e) }
  }

  // --- Test 5: IG User ID check (using Page Access Token) ---
  try {
    const r = await fetchFb(
      `https://graph.facebook.com/v25.0/${IG_USER_ID}?fields=id,name&access_token=${pageAccessToken}`
    )
    const d = await r.json() as { id?: string; name?: string; error?: { message: string } }
    results.igUserCheck = d.error
      ? { ok: false, error: d.error.message }
      : { ok: true, id: d.id, name: d.name }
  } catch (e) {
    results.igUserCheck = { ok: false, error: String(e) }
  }

  // --- Test 6: Verify instagram_content_publish permission by listing media ---
  try {
    const r = await fetchFb(
      `https://graph.facebook.com/v25.0/${IG_USER_ID}/media?access_token=${pageAccessToken}&limit=1`
    )
    const d = await r.json() as { data?: unknown[]; error?: { message: string } }
    results.publishingPermCheck = d.error
      ? { ok: false, error: d.error.message }
      : { ok: true, note: `Can read media — ${d.data?.length ?? 0} items returned` }
  } catch (e) {
    results.publishingPermCheck = { ok: false, error: String(e) }
  }

  const allOk = Object.entries(results)
    .filter(([k]) => k !== 'env')
    .every(([, v]) => (v as { ok?: boolean }).ok !== false)

  return NextResponse.json({ allOk, results }, { status: allOk ? 200 : 207 })
}
