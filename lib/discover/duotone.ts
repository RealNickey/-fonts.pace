import { DuotoneItem } from '@/types'
import { randomUUID } from 'crypto'
import { kv } from '@/lib/kv'
import { addSeen } from '@/lib/dedup'

// Color distance using Euclidean distance in RGB space
function colorDistance(hex1: string, hex2: string): number {
  const c1 = hexToRgb(hex1)
  const c2 = hexToRgb(hex2)
  return Math.sqrt(
    Math.pow(c1[0] - c2[0], 2) +
    Math.pow(c1[1] - c2[1], 2) +
    Math.pow(c1[2] - c2[2], 2)
  )
}

// Distance threshold below which two duotone pairs are considered too similar
const SIMILARITY_THRESHOLD = 50

export async function discoverDuotones(): Promise<DuotoneItem[]> {
  const items: DuotoneItem[] = []
  const usedPairs = new Set<string>()
  const targetCount = 5
  let attempts = 0

  // Fetch past duotones from KV to prevent similar combos
  const pastDuotonesRaw = await kv.smembers('seen:duotone')
  const pastDuotones = pastDuotonesRaw.map(str => {
    const [h1, h2] = (str as string).split('-')
    return { h1, h2 }
  })

  while (items.length < targetCount && attempts < 80) {
    attempts += 1
    const { hex1, hex2 } = generateDuotonePair()
    const key = `${hex1}-${hex2}`

    if (usedPairs.has(key)) continue
    if (contrastRatio(hex1, hex2) < 4.5) continue

    // Euclidean Check against past duotones
    let isTooSimilar = false
    for (const past of pastDuotones) {
      const dist1 = colorDistance(hex1, past.h1)
      const dist2 = colorDistance(hex2, past.h2)
      // Also check swapped colors
      const dist3 = colorDistance(hex1, past.h2)
      const dist4 = colorDistance(hex2, past.h1)

      if ((dist1 < SIMILARITY_THRESHOLD && dist2 < SIMILARITY_THRESHOLD) ||
          (dist3 < SIMILARITY_THRESHOLD && dist4 < SIMILARITY_THRESHOLD)) {
        isTooSimilar = true
        break
      }
    }

    if (isTooSimilar) continue

    const [name1, name2] = await getColorNames(hex1, hex2)
    items.push({
      id: randomUUID(),
      hex1,
      name1,
      hex2,
      name2,
    })
    usedPairs.add(key)
    pastDuotones.push({ h1: hex1, h2: hex2 })
    // We add to dedup store later in the API route, or directly here?
    // Usually it's done in the route but since we have access, we can defer to the caller.
  }

  return items
}

function generateDuotonePair() {
  const baseHue = Math.floor(Math.random() * 360)
  const hueOffset = 170 + Math.random() * 20
  const h1 = baseHue
  const h2 = (baseHue + hueOffset) % 360

  const s1 = 65 + Math.random() * 25
  const s2 = 65 + Math.random() * 25
  const l1 = 18 + Math.random() * 18
  const l2 = 68 + Math.random() * 18

  return {
    hex1: hslToHex(h1, s1, l1),
    hex2: hslToHex(h2, s2, l2),
  }
}

async function getColorNames(hex1: string, hex2: string) {
  let name1 = hex1
  let name2 = hex2

  try {
    const res = await fetch(
      `https://api.color.pizza/v1/${hex1.replace('#', '')},${hex2.replace('#', '')}`
    )
    const data = await res.json()
    if (data.colors && data.colors.length === 2) {
      name1 = data.colors[0].name
      name2 = data.colors[1].name
    }
  } catch (error) {}

  return [name1, name2]
}

function contrastRatio(hex1: string, hex2: string) {
  const l1 = relativeLuminance(hex1)
  const l2 = relativeLuminance(hex2)
  const [lighter, darker] = l1 >= l2 ? [l1, l2] : [l2, l1]
  return (lighter + 0.05) / (darker + 0.05)
}

function relativeLuminance(hex: string) {
  const [r, g, b] = hexToRgb(hex)
  const toLinear = (v: number) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  const rl = toLinear(r)
  const gl = toLinear(g)
  const bl = toLinear(b)
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl
}

function hexToRgb(hex: string) {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return [r, g, b]
}

function hslToHex(h: number, s: number, l: number): string {
    l /= 100
    const a = s * Math.min(l, 1 - l) / 100
    const f = (n: number) => {
        const k = (n + h / 30) % 12
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
        return Math.round(255 * color).toString(16).padStart(2, '0')
    }
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase()
}
