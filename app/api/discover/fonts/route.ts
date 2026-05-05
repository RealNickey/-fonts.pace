import { NextResponse } from 'next/server'
import { discoverGoogleFonts } from '@/lib/discover/google-fonts'
import { discoverFontshare } from '@/lib/discover/fontshare'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const [googleFonts, fontshareFonts] = await Promise.allSettled([
    discoverGoogleFonts(),
    discoverFontshare(),
  ])
  return NextResponse.json({
    googleFonts: googleFonts.status === 'fulfilled' ? googleFonts.value : [],
    fontshareFonts: fontshareFonts.status === 'fulfilled' ? fontshareFonts.value : [],
  })
}
