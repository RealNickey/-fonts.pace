import { NextRequest, NextResponse } from 'next/server'
import { renderSlide, uploadSlide } from '@/lib/render'
import { TitleCard } from '@/lib/slides/title-card'
import { FontSlide } from '@/lib/slides/font-slide'
import { PaletteSlide } from '@/lib/slides/palette-slide'
import { CTACard } from '@/lib/slides/cta-card'
import { DuotoneSlide } from '@/lib/slides/duotone-slide'
import { DuotoneTitleCard } from '@/lib/slides/duotone-title-card'
import { DuotoneCTACard } from '@/lib/slides/duotone-cta-card'
import { FontItem, PaletteItem, DuotoneItem } from '@/types'
import React from 'react'

export const maxDuration = 60
export const runtime = 'nodejs'

const ALLOWED_FONT_HOSTS = [
  'fonts.gstatic.com',
  'api.fontshare.com',
  'cdn.fontshare.com',
]

/**
 * Validates a font URL against the allowlist and returns a parsed URL object
 * if safe, or null otherwise. The caller must use the returned URL object
 * (not the original string) to prevent SSRF.
 */
function getSafeFontUrl(rawUrl: string): URL | null {
  try {
    const parsed = new URL(rawUrl)
    if (
      parsed.protocol === 'https:' &&
      ALLOWED_FONT_HOSTS.some(h => parsed.hostname === h || parsed.hostname.endsWith(`.${h}`))
    ) {
      return parsed
    }
  } catch {}
  return null
}

async function loadJaroFont(): Promise<ArrayBuffer | undefined> {
  try {
    const cssRes = await fetch('https://fonts.googleapis.com/css2?family=Jaro&display=swap', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })
    const css = await cssRes.text()
    const match = css.match(/url\((https:\/\/fonts\.gstatic\.com[^)]+\.(?:woff2|ttf))\)/)
    if (match) {
      const fontRes = await fetch(match[1])
      return await fontRes.arrayBuffer()
    }
  } catch (error) {
    console.warn('Failed to fetch Jaro font', error)
  }
  return undefined
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { type, items, postId } = body

  const slideUrls: string[] = []
  
  let title = ''
  if (type === 'fonts') title = `${items.length} Fonts Worth Knowing`
  else if (type === 'palettes') title = `${items.length} Color Palettes to Steal`
  else if (type === 'duotone') title = `${items.length} Duotone Palettes`
  
  const isDuotone = type === 'duotone'
  const height = isDuotone ? 1350 : 1080
  const seedDuotone = isDuotone ? (items?.[0] as DuotoneItem | undefined) : undefined
  const jaroFontData = isDuotone ? await loadJaroFont() : undefined
  const jaroFonts = jaroFontData ? [{ name: 'Jaro', data: jaroFontData, weight: 400 as const }] : []

  const titleElement = isDuotone
    ? React.createElement(DuotoneTitleCard, { title, item: seedDuotone })
    : React.createElement(TitleCard, { title })
  const titleBuffer = await renderSlide(titleElement, isDuotone ? jaroFonts : [], height)
  slideUrls.push(await uploadSlide(titleBuffer, `slides/${postId}/0.png`))

  if (type === 'fonts') {
    for (let i = 0; i < items.length; i++) {
      const font = items[i] as FontItem
      let fontData: ArrayBuffer | undefined
      const safeUrl = getSafeFontUrl(font.fontFileUrl)
      if (safeUrl) {
        try {
          const fontRes = await fetch(safeUrl)
          fontData = await fontRes.arrayBuffer()
        } catch (_error) {
          console.warn(`Failed to fetch font file: ${safeUrl.hostname}`)
        }
      }
      const fonts = fontData
        ? [{ name: font.name, data: fontData, weight: 400 as const }]
        : []
      const buffer = await renderSlide(React.createElement(FontSlide, { font }), fonts, height)
      slideUrls.push(await uploadSlide(buffer, `slides/${postId}/${i + 1}.png`))
    }
  } else if (type === 'palettes') {
    for (let i = 0; i < items.length; i++) {
      const palette = items[i] as PaletteItem
      const buffer = await renderSlide(React.createElement(PaletteSlide, { palette }), [], height)
      slideUrls.push(await uploadSlide(buffer, `slides/${postId}/${i + 1}.png`))
    }
  } else if (type === 'duotone') {
    for (let i = 0; i < items.length; i++) {
      const item = items[i] as DuotoneItem
      const buffer = await renderSlide(React.createElement(DuotoneSlide, { item }), jaroFonts, height)
      slideUrls.push(await uploadSlide(buffer, `slides/${postId}/${i + 1}.png`))
    }
  }

  const ctaElement = isDuotone
    ? React.createElement(DuotoneCTACard, { item: seedDuotone })
    : React.createElement(CTACard)
  const ctaBuffer = await renderSlide(ctaElement, isDuotone ? jaroFonts : [], height)
  slideUrls.push(await uploadSlide(ctaBuffer, `slides/${postId}/${items.length + 1}.png`))

  return NextResponse.json({ slideUrls })
}
