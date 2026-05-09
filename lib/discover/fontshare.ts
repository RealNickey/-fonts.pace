import { FontItem } from '@/types'
import { isSeen } from '@/lib/dedup'
import dns from 'dns'

dns.setDefaultResultOrder('ipv4first')

export async function discoverFontshare(): Promise<FontItem[]> {
  // Fetch multiple pages so the seen-set doesn't exhaust all candidates.
  // Fontshare v2 API: font file URL lives in styles[].file (protocol-relative //cdn.fontshare.com/…)
  const pages = await Promise.allSettled([
    fetch('https://api.fontshare.com/v2/fonts?page=1&per_page=50').then(r => r.ok ? r.json() : { fonts: [] }),
    fetch('https://api.fontshare.com/v2/fonts?page=2&per_page=50').then(r => r.ok ? r.json() : { fonts: [] }),
    fetch('https://api.fontshare.com/v2/fonts?page=3&per_page=50').then(r => r.ok ? r.json() : { fonts: [] }),
  ])
  const fonts = pages.flatMap(p => p.status === 'fulfilled' ? (p.value.fonts ?? []) : [])

  const results: FontItem[] = []
  for (const font of fonts) {
    const seen = await isSeen('fonts', font.slug)
    if (seen) continue

    // v2 API: file URL is in styles[].file (default style first)
    // The URL is protocol-relative (//cdn.fontshare.com/...), prepend https:
    const defaultStyle = font.styles?.find((s: any) => s.default) ?? font.styles?.[0]
    const rawFileUrl: string | undefined = defaultStyle?.file
    if (!rawFileUrl) continue

    const fontFileUrl = rawFileUrl.startsWith('//') ? `https:${rawFileUrl}.woff2` : `${rawFileUrl}.woff2`

    results.push({
      id: font.slug,
      name: font.name,
      category: mapCategory(font.category?.slug ?? ''),
      designer: font.designers?.[0]?.name ?? font.publisher?.name ?? 'Fontshare',
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
