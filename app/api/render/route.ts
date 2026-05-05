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
      try {
        const fontRes = await fetch(font.fontFileUrl)
        fontData = await fontRes.arrayBuffer()
      } catch (_) {}
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
