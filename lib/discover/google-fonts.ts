import { FontItem } from '@/types'
import { isSeen } from '@/lib/dedup'
import { env } from '@/lib/env'
import dns from 'dns'

dns.setDefaultResultOrder('ipv4first')

export async function discoverGoogleFonts(): Promise<FontItem[]> {
  const apiKey = env.googleFontsApiKey

  // Fetch a broad pool across multiple sort orders so the seen-set
  // doesn't exhaust all candidates in a few runs.
  const fetchPool = async (sort: string) => {
    const res = await fetch(`https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}&sort=${sort}`)
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Google Fonts API error (sort=${sort}): ${res.status} — ${body.slice(0, 200)}`)
    }
    return res.json()
  }

  const [byDate, byPopularity] = await Promise.allSettled([
    fetchPool('date'),
    fetchPool('popularity'),
  ])

  if (byDate.status === 'rejected') console.warn('[google-fonts] date fetch failed:', byDate.reason)
  if (byPopularity.status === 'rejected') console.warn('[google-fonts] popularity fetch failed:', byPopularity.reason)

  const dateItems: any[] = byDate.status === 'fulfilled' ? (byDate.value.items ?? []).slice(0, 100) : []
  const popItems: any[] = byPopularity.status === 'fulfilled' ? (byPopularity.value.items ?? []).slice(0, 100) : []

  if (dateItems.length === 0 && popItems.length === 0) {
    throw new Error('Google Fonts API returned no items — API key may be blocked or missing Web Fonts permission')
  }

  // Merge and deduplicate by family name
  const deduped = new Set<string>()
  const merged: any[] = []
  for (const item of [...dateItems, ...popItems]) {
    if (!deduped.has(item.family)) {
      deduped.add(item.family)
      merged.push(item)
    }
  }

  const results: FontItem[] = []
  for (const font of merged) {
    const seen = await isSeen('fonts', font.family)
    if (seen) continue

    let fileUrl = font.files?.regular || font.files?.['400'] || Object.values(font.files || {})[0]
    if (!fileUrl || typeof fileUrl !== 'string') continue

    fileUrl = fileUrl.replace(/^http:\/\//i, 'https://')

    results.push({
      id: font.family.toLowerCase().replace(/\s+/g, '-'),
      name: font.family,
      category: mapCategory(font.category),
      designer: font.subsets?.join(', ') ?? 'Google',
      source: 'google_fonts',
      fontFileUrl: fileUrl,
      fontFileFormat: fileUrl.split('.').pop(),
      fontWeight: 400,
      previewText: 'The quick brown fox',
      downloadUrl: `https://fonts.google.com/specimen/${encodeURIComponent(font.family)}`,
    })

    if (results.length >= 30) break
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
