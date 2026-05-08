import { PaletteItem } from '@/types'
import { isSeen } from '@/lib/dedup'

export async function discoverColorHunt(): Promise<PaletteItem[]> {
  const res = await fetch('https://colorhunt.co/php/feed.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'step=0&sort=popular&tags=&timeframe=30',
  })
  if (!res.ok) throw new Error(`ColorHunt API error: ${res.status}`)
  const data = await res.json()

  const results: PaletteItem[] = []
  for (const item of data) {
    const code: string = item.code
    if (!code || code.length < 24) continue
    const seen = await isSeen('palettes', code)
    if (seen) continue

    const colors = [0, 6, 12, 18].map(i => '#' + code.slice(i, i + 6))

    // Fetch color names
    let colorNames = colors
    try {
      const cleanHexes = colors.map(c => c.replace('#', '')).join(',')
      const nameRes = await fetch(`https://api.color.pizza/v1/${cleanHexes}`)
      if (nameRes.ok) {
        const nameData = await nameRes.json()
        if (nameData.colors && nameData.colors.length === colors.length) {
          colorNames = nameData.colors.map((c: any) => c.name)
        }
      }
    } catch (e) {
      console.warn('Failed to fetch color names for palette', e)
    }

    results.push({
      id: code,
      colors,
      colorNames,
      source: 'colorhunt',
      sourceUrl: `https://colorhunt.co/palette/${code}`,
      likes: item.likes ?? 0,
    })
    if (results.length >= 8) break
  }
  return results
}
