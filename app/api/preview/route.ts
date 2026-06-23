import { NextRequest, NextResponse } from 'next/server'
import { renderSlide, fetchRenderFont } from '@/lib/render'
import { FontSlide } from '@/lib/slides/font-slide'
import { PaletteSlide } from '@/lib/slides/palette-slide'
import { DuotoneSlide } from '@/lib/slides/duotone-slide'
import React from 'react'
import fs from 'fs'
import path from 'path'
import { put } from '@vercel/blob'

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
      return await fetchRenderFont(match[1])
    }
  } catch (error) {
    console.warn('Failed to fetch Jaro font', error)
  }
  return undefined
}

/**
 * Pre-renders and uploads a middle preview slide to a stable Blob URL if it doesn't exist or needs update.
 */
async function getCachedMidPreview(template: string): Promise<string> {
  const filename = `previews/${template}-mid.png`
  
  let buffer: Buffer
  if (template === 'fonts') {
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
    buffer = await renderSlide(React.createElement(FontSlide, { font: dummyFont }), [], 1350)
  } else if (template === 'palettes') {
    const dummyPalette = {
      id: 'dummy',
      colors: ['#FFD60A', '#FF9F0A', '#FF453A', '#BF5AF2'],
      colorNames: ['Yellow', 'Orange', 'Red', 'Purple'],
      source: 'colorhunt' as const,
      sourceUrl: '',
      likes: 0
    }
    buffer = await renderSlide(React.createElement(PaletteSlide, { palette: dummyPalette }), [], 1080)
  } else { // duotone
    const dummyDuotone = {
      id: 'dummy',
      hex1: '#FFD60A',
      name1: 'Cyber Yellow',
      hex2: '#000000',
      name2: 'Black'
    }
    const jaroFontData = await loadJaroFont()
    const jaroFonts = jaroFontData ? [{ name: 'Jaro', data: jaroFontData, weight: 400 as const }] : []
    buffer = await renderSlide(React.createElement(DuotoneSlide, { item: dummyDuotone }), jaroFonts, 1350)
  }

  const blob = await put(filename, buffer, {
    access: 'public',
    contentType: 'image/png',
    addRandomSuffix: false,
    allowOverwrite: true,
  })
  
  return blob.url
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const template = searchParams.get('template') || 'fonts'

  try {
    // 1. Get stable middle preview from Blob
    const midUrl = await getCachedMidPreview(template)

    // 2. Get static first/last as base64 for immediate feedback
    let firstBase64 = ''
    let lastBase64 = ''

    if (template === 'fonts') {
      const firstPath = path.join(process.cwd(), 'public/assets/font-first.png')
      const lastPath = path.join(process.cwd(), 'public/assets/font-last.png')
      if (fs.existsSync(firstPath)) firstBase64 = fs.readFileSync(firstPath).toString('base64')
      if (fs.existsSync(lastPath)) lastBase64 = fs.readFileSync(lastPath).toString('base64')
    } else if (template === 'duotone') {
      const firstPath = path.join(process.cwd(), 'public/assets/first-page.png')
      const lastPath = path.join(process.cwd(), 'public/assets/last-page.png')
      if (fs.existsSync(firstPath)) firstBase64 = fs.readFileSync(firstPath).toString('base64')
      if (fs.existsSync(lastPath)) lastBase64 = fs.readFileSync(lastPath).toString('base64')
    }

    return NextResponse.json({
      first: firstBase64 ? `data:image/png;base64,${firstBase64}` : null,
      mid: midUrl,
      last: lastBase64 ? `data:image/png;base64,${lastBase64}` : null,
    })

  } catch (error) {
    console.error('Preview error:', error)
    return NextResponse.json({ error: 'Failed to generate preview' }, { status: 500 })
  }
}
