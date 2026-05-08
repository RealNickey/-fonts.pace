import { FontItem } from '@/types'
import { isSeen } from '@/lib/dedup'
import { env } from '@/lib/env'

export async function discoverGoogleFonts(): Promise<FontItem[]> {
  const apiKey = env.googleFontsApiKey

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

    const fontFileUrl = font.files.regular || font.files[Object.keys(font.files)[0]]

    results.push({
      id: font.family.toLowerCase().replace(/\s+/g, '-'),
      name: font.family,
      category: mapCategory(font.category),
      designer: font.subsets?.join(', ') ?? 'Google',
      source: 'google_fonts',
      fontFileUrl: fontFileUrl,
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
