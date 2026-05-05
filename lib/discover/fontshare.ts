import { FontItem } from '@/types'
import { isSeen } from '@/lib/dedup'

export async function discoverFontshare(): Promise<FontItem[]> {
  const res = await fetch('https://api.fontshare.com/v2/fonts?page=1&per_page=20')
  if (!res.ok) throw new Error(`Fontshare API error: ${res.status}`)
  const data = await res.json()
  const fonts = data.fonts ?? []

  const results: FontItem[] = []
  for (const font of fonts) {
    const seen = await isSeen('fonts', font.slug)
    if (seen) continue

    const fontFileUrl =
      font.files?.variable?.url ?? font.files?.regular?.url ?? ''
    if (!fontFileUrl) continue

    results.push({
      id: font.slug,
      name: font.name,
      category: mapCategory(font.category?.slug ?? ''),
      designer: font.designers?.[0]?.name ?? 'Fontshare',
      source: 'fontshare',
      fontFileUrl,
      previewText: 'The quick brown fox',
      downloadUrl: `https://www.fontshare.com/fonts/${font.slug}`,
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
