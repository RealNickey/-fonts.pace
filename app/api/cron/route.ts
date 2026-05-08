import { NextRequest, NextResponse } from 'next/server'
import { discoverGoogleFonts } from '@/lib/discover/google-fonts'
import { discoverFontshare } from '@/lib/discover/fontshare'
import { discoverColorHunt } from '@/lib/discover/colorhunt'
import { discoverDuotones } from '@/lib/discover/duotone'
import { renderSlide, uploadSlide } from '@/lib/render'
import { addPost, addSeen } from '@/lib/store'
import { TitleCard } from '@/lib/slides/title-card'
import { FontSlide } from '@/lib/slides/font-slide'
import { PaletteSlide } from '@/lib/slides/palette-slide'
import { CTACard } from '@/lib/slides/cta-card'
import { DuotoneSlide } from '@/lib/slides/duotone-slide'
import { DuotoneTitleCard } from '@/lib/slides/duotone-title-card'
import { DuotoneCTACard } from '@/lib/slides/duotone-cta-card'
import { Post, FontItem, PaletteItem, DuotoneItem } from '@/types'
import { randomUUID } from 'crypto'
import React from 'react'
import { env } from '@/lib/env'

const ALLOWED_FONT_HOSTS = ['fonts.gstatic.com', 'api.fontshare.com', 'cdn.fontshare.com']

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
      const fontRes = await fetch(match[1])
      return await fontRes.arrayBuffer()
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
  const generateFonts = templateParam === 'all' || templateParam === 'fonts'
  const generatePalettes = templateParam === 'all' || templateParam === 'palettes'
  const generateDuotones = templateParam === 'all' || templateParam === 'duotone'

  // Discover fonts
  let allFonts: FontItem[] = []
  if (generateFonts) {
    const [googleFonts, fontshareFonts] = await Promise.allSettled([
      discoverGoogleFonts(),
      discoverFontshare(),
    ])

    allFonts = [
      ...(googleFonts.status === 'fulfilled' ? googleFonts.value : []),
      ...(fontshareFonts.status === 'fulfilled' ? fontshareFonts.value : []),
    ].slice(0, 5)
  }

  // Discover palettes
  let allPalettes: PaletteItem[] = []
  if (generatePalettes) {
    const palettesResult = await Promise.allSettled([discoverColorHunt()])
    allPalettes = (
      palettesResult[0].status === 'fulfilled' ? palettesResult[0].value : []
    ).slice(0, 5)
  }

  // Discover duotones
  let allDuotones: DuotoneItem[] = []
  if (generateDuotones) {
    allDuotones = await discoverDuotones()
  }

  const postsCreated: string[] = []

  // Generate font post
  if (allFonts.length > 0) {
    const postId = randomUUID()
    const title = `${allFonts.length} Fonts Worth Knowing`
    const slideUrls: string[] = []

    // Fetch font files and render slides
    const titleBuffer = await renderSlide(React.createElement(TitleCard, { title }))
    slideUrls.push(await uploadSlide(titleBuffer, `slides/${postId}/0.png`))

    for (let i = 0; i < allFonts.length; i++) {
      const font = allFonts[i]
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
      const buffer = await renderSlide(
        React.createElement(FontSlide, { font }),
        fonts
      )
      slideUrls.push(await uploadSlide(buffer, `slides/${postId}/${i + 1}.png`))
    }

    const ctaBuffer = await renderSlide(React.createElement(CTACard))
    slideUrls.push(await uploadSlide(ctaBuffer, `slides/${postId}/${allFonts.length + 1}.png`))

    const caption = `5 fonts you need to know 🖋️\n\n${allFonts.map(f => f.name).join(' · ')}\n\n#typography #fonts #design #uidesign #typeface #graphicdesign #fontoftheday #designinspiration`

    const post: Post = {
      id: postId,
      type: 'fonts',
      title,
      items: allFonts,
      slideUrls,
      caption,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    await addPost(post)
    for (const font of allFonts) {
      await addSeen('fonts', font.source === 'google_fonts' ? font.name : font.id)
    }
    postsCreated.push(postId)
  }

  // Generate palette post
  if (allPalettes.length > 0) {
    const postId = randomUUID()
    const title = `${allPalettes.length} Color Palettes to Steal`
    const slideUrls: string[] = []

    const titleBuffer = await renderSlide(React.createElement(TitleCard, { title }))
    slideUrls.push(await uploadSlide(titleBuffer, `slides/${postId}/0.png`))

    for (let i = 0; i < allPalettes.length; i++) {
      const palette = allPalettes[i]
      const buffer = await renderSlide(React.createElement(PaletteSlide, { palette }))
      slideUrls.push(await uploadSlide(buffer, `slides/${postId}/${i + 1}.png`))
    }

    const ctaBuffer = await renderSlide(React.createElement(CTACard))
    slideUrls.push(await uploadSlide(ctaBuffer, `slides/${postId}/${allPalettes.length + 1}.png`))

    const firstPalette = allPalettes[0]
    const caption = `Color palettes to steal 🎨\n\n${firstPalette.colors.join(' ')}\n\n#colorpalette #colorinspiration #design #uidesign #colorscheme #graphicdesign #colortheory #designinspiration`

    const post: Post = {
      id: postId,
      type: 'palettes',
      title,
      items: allPalettes,
      slideUrls,
      caption,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    await addPost(post)
    for (const palette of allPalettes) {
      await addSeen('palettes', palette.id)
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

    const titleBuffer = await renderSlide(
      React.createElement(DuotoneTitleCard, { title, item: seedDuotone }),
      jaroFonts,
      1350
    )
    slideUrls.push(await uploadSlide(titleBuffer, `slides/${postId}/0.png`))

    for (let i = 0; i < allDuotones.length; i++) {
      const item = allDuotones[i]
      const buffer = await renderSlide(React.createElement(DuotoneSlide, { item }), jaroFonts, 1350)
      slideUrls.push(await uploadSlide(buffer, `slides/${postId}/${i + 1}.png`))
    }

    const ctaBuffer = await renderSlide(
      React.createElement(DuotoneCTACard, { item: seedDuotone }),
      jaroFonts,
      1350
    )
    slideUrls.push(await uploadSlide(ctaBuffer, `slides/${postId}/${allDuotones.length + 1}.png`))

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
    await addPost(post)
    for (const duotone of allDuotones) {
      await addSeen('duotone', `${duotone.hex1}-${duotone.hex2}`)
    }
    postsCreated.push(postId)
  }

  return NextResponse.json({ ok: true, postsCreated: postsCreated.length })
}
