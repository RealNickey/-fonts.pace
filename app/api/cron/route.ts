import { NextRequest, NextResponse } from 'next/server'
import { discoverGoogleFonts } from '@/lib/discover/google-fonts'
import { discoverFontshare } from '@/lib/discover/fontshare'
import { discoverDuotones } from '@/lib/discover/duotone'
import { fetchRenderFont, renderSlide, uploadSlide, getStaticAssetUrl } from '@/lib/render'
import { addPost, addSeen } from '@/lib/store'
import { TitleCard } from '@/lib/slides/title-card'
import { FontSlide } from '@/lib/slides/font-slide'
import { CTACard } from '@/lib/slides/cta-card'
import { DuotoneSlide } from '@/lib/slides/duotone-slide'
import { DuotoneTitleCard } from '@/lib/slides/duotone-title-card'
import { DuotoneCTACard } from '@/lib/slides/duotone-cta-card'
import { Post, FontItem, DuotoneItem } from '@/types'
import { randomUUID } from 'crypto'
import React from 'react'
import { env } from '@/lib/env'
import { getAccessToken } from '@/lib/token'
import fs from 'fs'
import path from 'path'
import { kv } from '@/lib/kv'
import { uploadSlideToIG, createCarousel, publishCarousel } from '@/lib/instagram'
import { del } from '@vercel/blob'


export const maxDuration = 60
export const runtime = 'nodejs'

async function loadJaroFont(): Promise<ArrayBuffer | undefined> {
  try {
    const cssRes = await fetch('https://fonts.googleapis.com/css2?family=Jaro&display=swap', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })
    const css = await cssRes.text()
    const match = css.match(/url\((https:\/\/fonts\.gstatic\.com[^)]+\.(?:woff2|ttf))\)/)
    if (match) {
      // Use fetchRenderFont so WOFF2 files get decompressed to TTF for Satori
      return await fetchRenderFont(match[1])
    }
  } catch (error) {
    console.warn('Failed to fetch Jaro font', error)
  }
  return undefined
}

export async function GET(req: NextRequest) {
  const secret = env.cronSecret
  const auth = req.headers.get('authorization')
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const templateParam = searchParams.get('template') || 'all'

  let currentTemplate = templateParam
  if (templateParam === 'all') {
    const lastTemplate = await kv.get<string>('settings:last_cron_template')
    currentTemplate = lastTemplate === 'fonts' ? 'duotone' : 'fonts'
    await kv.set('settings:last_cron_template', currentTemplate)
    console.log(`[cron] Alternating template: last was "${lastTemplate}", selected "${currentTemplate}"`)
  }

  const generateFonts = currentTemplate === 'fonts'
  const generateDuotones = currentTemplate === 'duotone'

  // Proactively refresh the Instagram access token if it is close to expiring.
  // This runs every day via the cron and keeps the token alive indefinitely
  // without any manual intervention (as long as FB_APP_ID + FB_APP_SECRET are set).
  const activeToken = await getAccessToken()
  if (!activeToken) {
    console.warn('[cron] No Instagram access token available — publishing will be skipped.')
  } else {
    console.log('[cron] Instagram token is active.')
  }

  // Discover fonts
  let renderableFonts: { font: FontItem; data: ArrayBuffer }[] = []
  if (generateFonts) {
    const [googleFontsRes, fontshareFontsRes] = await Promise.allSettled([
      discoverGoogleFonts(),
      discoverFontshare(),
    ])

    const googleFonts = googleFontsRes.status === 'fulfilled' ? googleFontsRes.value : []
    const fontshareFonts = fontshareFontsRes.status === 'fulfilled' ? fontshareFontsRes.value : []

    if (googleFontsRes.status === 'rejected') console.warn('[cron] Google Fonts discovery failed:', googleFontsRes.reason)
    if (fontshareFontsRes.status === 'rejected') console.warn('[cron] Fontshare discovery failed:', fontshareFontsRes.reason)

    console.log(`[cron] Discovery results — Google: ${googleFonts.length}, Fontshare: ${fontshareFonts.length}`)

    const candidates = [...googleFonts, ...fontshareFonts]
    const baseNames = new Set<string>()
    
    for (const font of candidates) {
      // Get base name (first word) to prevent variations of the same font
      const baseName = font.name.split(' ')[0].toLowerCase()
      if (baseNames.has(baseName)) continue

      const data = await fetchRenderFont(font.fontFileUrl)
      if (data) {
        renderableFonts.push({ font, data })
        baseNames.add(baseName)
      } else {
        console.log(`[cron] Skipped font (not renderable): ${font.name} [${font.fontFileUrl}]`)
      }
      if (renderableFonts.length >= 5) break
    }
    console.log(`[cron] Font candidates: ${candidates.length}, renderable: ${renderableFonts.length}`)

  }

  // Discover duotones
  let allDuotones: DuotoneItem[] = []
  if (generateDuotones) {
    allDuotones = await discoverDuotones()
  }

  const postsCreated: string[] = []

  // Generate font post
  if (renderableFonts.length > 0) {
    const postId = randomUUID()
    const title = `${renderableFonts.length} Fonts Worth Knowing`
    const slideUrls: string[] = []

    const jaroFontData = await loadJaroFont()
    const jaroFonts = jaroFontData ? [{ name: 'Jaro', data: jaroFontData, weight: 400 as const }] : []

    // Optimization: Use static font first page directly
    slideUrls.push(await getStaticAssetUrl('font-first.png'))

    for (let i = 0; i < renderableFonts.length; i++) {
      const { font, data } = renderableFonts[i]

      const fontDef = [{ name: font.name, data, weight: 400 as const }]
      const buffer = await renderSlide(
        React.createElement(FontSlide, { font }),
        fontDef,
        1350
      )
      slideUrls.push(await uploadSlide(buffer, `slides/${postId}/${i + 1}.png`))
    }

    // Optimization: Use static font last page directly
    slideUrls.push(await getStaticAssetUrl('font-last.png'))

    const caption = `5 fonts you need to know 🖋️\n\n${renderableFonts.map(f => f.font.name).join(' · ')}\n\n#typography #fonts #design #uidesign #typeface #graphicdesign #fontoftheday #designinspiration`

    const post: Post = {
      id: postId,
      type: 'fonts',
      title,
      items: renderableFonts.map(r => r.font),
      slideUrls,
      caption,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    const approvalRequired = (await kv.get<boolean>('settings:approval_required')) ?? false
    let isPublished = false
    let igMediaId = ''

    if (!approvalRequired) {
      try {
        console.log(`[cron] Approval bypassed. Auto-publishing fonts post ${postId} to Instagram...`)
        const childIds = await Promise.all(post.slideUrls.map(url => uploadSlideToIG(url)))
        const containerId = await createCarousel(childIds, post.caption)
        const mediaId = await publishCarousel(containerId)
        if (mediaId) {
          igMediaId = mediaId
          isPublished = true
        }
      } catch (error) {
        console.error(`[cron] Direct publishing failed for post ${postId}:`, error)
      }
    }

    if (isPublished) {
      post.status = 'published'
      post.igMediaId = igMediaId
      post.publishedAt = new Date().toISOString()
    }

    await addPost(post)

    if (isPublished) {
      const slidesToDelete = post.slideUrls.filter(url => 
        !url.includes('/static/') && !url.includes('/previews/')
      )
      if (slidesToDelete.length > 0) {
        try {
          await del(slidesToDelete)
          console.log(`[cron] Deleted ${slidesToDelete.length} blobs for auto-published post ${postId}`)
        } catch (e) {
          console.error(`[cron] Failed to delete blobs for post ${postId}:`, e)
        }
      }
    }

    for (const { font } of renderableFonts) {
      await addSeen('fonts', font.source === 'google_fonts' ? font.name : font.id)
    }
    postsCreated.push(postId)
  }

  // Generate duotone post
  if (allDuotones.length > 0) {
    const postId = randomUUID()
    const title = `${allDuotones.length} Duotone Palettes`
    const slideUrls: string[] = []

    const seedDuotone = allDuotones[0]
    const jaroFontData = await loadJaroFont()
    const jaroFonts = jaroFontData ? [{ name: 'Jaro', data: jaroFontData, weight: 400 as const }] : []

    // Optimization: Use static first page image directly (bypassing Satori)
    slideUrls.push(await getStaticAssetUrl('first-page.png'))

    for (let i = 0; i < allDuotones.length; i++) {
      const item = allDuotones[i]
      const buffer = await renderSlide(React.createElement(DuotoneSlide, { item }), jaroFonts, 1350)
      slideUrls.push(await uploadSlide(buffer, `slides/${postId}/${i + 1}.png`))
    }

    // Optimization: Use static last page image directly (bypassing Satori)
    slideUrls.push(await getStaticAssetUrl('last-page.png'))

    const caption = `Perfect color pairs 🎨\n\n#colorpalette #duotone #design #uidesign #colorscheme #graphicdesign #colortheory #designinspiration`

    const post: Post = {
      id: postId,
      type: 'duotone',
      title,
      items: allDuotones,
      slideUrls,
      caption,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    const approvalRequired = (await kv.get<boolean>('settings:approval_required')) ?? false
    let isPublished = false
    let igMediaId = ''

    if (!approvalRequired) {
      try {
        console.log(`[cron] Approval bypassed. Auto-publishing duotone post ${postId} to Instagram...`)
        const childIds = await Promise.all(post.slideUrls.map(url => uploadSlideToIG(url)))
        const containerId = await createCarousel(childIds, post.caption)
        const mediaId = await publishCarousel(containerId)
        if (mediaId) {
          igMediaId = mediaId
          isPublished = true
        }
      } catch (error) {
        console.error(`[cron] Direct publishing failed for post ${postId}:`, error)
      }
    }

    if (isPublished) {
      post.status = 'published'
      post.igMediaId = igMediaId
      post.publishedAt = new Date().toISOString()
    }

    await addPost(post)

    if (isPublished) {
      const slidesToDelete = post.slideUrls.filter(url => 
        !url.includes('/static/') && !url.includes('/previews/')
      )
      if (slidesToDelete.length > 0) {
        try {
          await del(slidesToDelete)
          console.log(`[cron] Deleted ${slidesToDelete.length} blobs for auto-published post ${postId}`)
        } catch (e) {
          console.error(`[cron] Failed to delete blobs for post ${postId}:`, e)
        }
      }
    }

    for (const duotone of allDuotones) {
      await addSeen('duotone', `${duotone.hex1}-${duotone.hex2}`)
    }
    postsCreated.push(postId)
  }

  const result = { ok: true, postsCreated: postsCreated.length }
  console.log(`[cron] Pipeline complete:`, result)
  return NextResponse.json(result)
}
