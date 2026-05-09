import { NextRequest, NextResponse } from 'next/server'
import { renderSlide, fetchRenderFont } from '@/lib/render'
import { TitleCard } from '@/lib/slides/title-card'
import { FontSlide } from '@/lib/slides/font-slide'
import { CTACard } from '@/lib/slides/cta-card'
import { DuotoneSlide } from '@/lib/slides/duotone-slide'
import { DuotoneTitleCard } from '@/lib/slides/duotone-title-card'
import { DuotoneCTACard } from '@/lib/slides/duotone-cta-card'
import React from 'react'

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
  const { searchParams } = new URL(req.url)
  const template = searchParams.get('template') || 'fonts'

  let firstBuffer: Buffer
  let midBuffer: Buffer
  let lastBuffer: Buffer

  try {
    if (template === 'fonts') {
      const title = '5 Fonts Worth Knowing'
      const dummyFont = {
        id: 'dummy',
        name: 'Inter',
        category: 'sans-serif' as const,
        designer: 'Rasmus Andersson',
        source: 'google_fonts' as const,
        fontFileUrl: '',
        previewText: 'The quick brown fox jumps over the lazy dog',
        downloadUrl: ''
      }

      firstBuffer = await renderSlide(React.createElement(TitleCard, { title }), [], 1350)
      midBuffer = await renderSlide(React.createElement(FontSlide, { font: dummyFont }), [], 1350)
      lastBuffer = await renderSlide(React.createElement(CTACard), [], 1350)
    }
    else { // duotone
      const title = '5 Duotone Palettes'
      const dummyDuotone = {
        id: 'dummy',
        hex1: '#FFD60A',
        name1: 'Cyber Yellow',
        hex2: '#000000',
        name2: 'Black'
      }

      const jaroFontData = await loadJaroFont()
      const jaroFonts = jaroFontData ? [{ name: 'Jaro', data: jaroFontData, weight: 400 as const }] : []

      firstBuffer = await renderSlide(React.createElement(DuotoneTitleCard, { title, item: dummyDuotone }), jaroFonts, 1350)
      midBuffer = await renderSlide(React.createElement(DuotoneSlide, { item: dummyDuotone }), jaroFonts, 1350)
      lastBuffer = await renderSlide(React.createElement(DuotoneCTACard, { item: dummyDuotone }), jaroFonts, 1350)
    }

    return NextResponse.json({
      first: `data:image/png;base64,${firstBuffer.toString('base64')}`,
      mid: `data:image/png;base64,${midBuffer.toString('base64')}`,
      last: `data:image/png;base64,${lastBuffer.toString('base64')}`,
    })

  } catch (error) {
    console.error('Preview error:', error)
    return NextResponse.json({ error: 'Failed to generate preview' }, { status: 500 })
  }
}
