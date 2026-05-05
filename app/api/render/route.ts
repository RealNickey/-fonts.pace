import { NextRequest, NextResponse } from 'next/server'
import { renderSlide, uploadSlide } from '@/lib/render'
import { TitleCard } from '@/lib/slides/title-card'
import { FontSlide } from '@/lib/slides/font-slide'
import { PaletteSlide } from '@/lib/slides/palette-slide'
import { CTACard } from '@/lib/slides/cta-card'
import { FontItem, PaletteItem } from '@/types'
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

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { type, items, postId } = body

  const slideUrls: string[] = []
  const title = type === 'fonts'
    ? `${items.length} Fonts Worth Knowing`
    : `${items.length} Color Palettes to Steal`

  const titleBuffer = await renderSlide(React.createElement(TitleCard, { title }))
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
      const buffer = await renderSlide(React.createElement(FontSlide, { font }), fonts)
      slideUrls.push(await uploadSlide(buffer, `slides/${postId}/${i + 1}.png`))
    }
  } else {
    for (let i = 0; i < items.length; i++) {
      const palette = items[i] as PaletteItem
      const buffer = await renderSlide(React.createElement(PaletteSlide, { palette }))
      slideUrls.push(await uploadSlide(buffer, `slides/${postId}/${i + 1}.png`))
    }
  }

  const ctaBuffer = await renderSlide(React.createElement(CTACard))
  slideUrls.push(await uploadSlide(ctaBuffer, `slides/${postId}/${items.length + 1}.png`))

  return NextResponse.json({ slideUrls })
}
