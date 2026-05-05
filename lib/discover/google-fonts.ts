import { FontItem } from '@/types'
import { isSeen } from '@/lib/dedup'

export async function discoverGoogleFonts(): Promise<FontItem[]> {
  const apiKey = process.env.GOOGLE_FONTS_API_KEY
  if (!apiKey) throw new Error('GOOGLE_FONTS_API_KEY is not set')

  const res = await fetch(
    `https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}&sort=date`
  )
  if (!res.ok) throw new Error(`Google Fonts API error: ${res.status}`)
  const data = await res.json()
  const fonts = data.items?.slice(0, 10) ?? []

  const results: FontItem[] = []
  for (const font of fonts) {
    const seen = await isSeen('fonts', font.family)
    if (seen) continue

    // Fetch CSS to extract woff2 URL
    const cssRes = await fetch(
      `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font.family)}`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    )
    const css = await cssRes.text()
    const match = css.match(/url\((https:\/\/fonts\.gstatic\.com[^)]+\.(?:woff2|ttf))\)/)
    if (!match) continue

    results.push({
      id: font.family.toLowerCase().replace(/\s+/g, '-'),
      name: font.family,
      category: mapCategory(font.category),
      designer: font.subsets?.join(', ') ?? 'Google',
      source: 'google_fonts',
      fontFileUrl: match[1],
      previewText: 'The quick brown fox',
      downloadUrl: `https://fonts.google.com/specimen/${encodeURIComponent(font.family)}`,
    })
  }
  return results
}

function mapCategory(cat: string): FontItem['category'] {
  const map: Record<string, FontItem['category']> = {
    serif: 'serif',
    'sans-serif': 'sans-serif',
    display: 'display',
    monospace: 'monospace',
    handwriting: 'handwriting',
  }
  return map[cat] ?? 'sans-serif'
}
