import { FontItem } from '@/types'
import { isSeen } from '@/lib/dedup'
import { env } from '@/lib/env'
import dns from 'dns'

dns.setDefaultResultOrder('ipv4first')

const GOOGLE_FONTS_FALLBACK: FontItem[] = [
  {
    id: "playfair-display",
    name: "Playfair Display",
    category: "serif",
    designer: "Google Fonts",
    source: "google_fonts",
    fontFileUrl: "https://fonts.gstatic.com/s/playfairdisplay/v40/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDTbtPY_Q.woff2",
    fontFileFormat: "woff2",
    fontWeight: 400,
    previewText: "The quick brown fox",
    downloadUrl: "https://fonts.google.com/specimen/Playfair%20Display"
  },
  {
    id: "montserrat",
    name: "Montserrat",
    category: "sans-serif",
    designer: "Google Fonts",
    source: "google_fonts",
    fontFileUrl: "https://fonts.gstatic.com/s/montserrat/v31/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Hw0aXpsog.woff2",
    fontFileFormat: "woff2",
    fontWeight: 400,
    previewText: "The quick brown fox",
    downloadUrl: "https://fonts.google.com/specimen/Montserrat"
  },
  {
    id: "lora",
    name: "Lora",
    category: "serif",
    designer: "Google Fonts",
    source: "google_fonts",
    fontFileUrl: "https://fonts.gstatic.com/s/lora/v37/0QI6MX1D_JOuGQbT0gvTJPa787weuxJMkq1umA.woff2",
    fontFileFormat: "woff2",
    fontWeight: 400,
    previewText: "The quick brown fox",
    downloadUrl: "https://fonts.google.com/specimen/Lora"
  },
  {
    id: "oswald",
    name: "Oswald",
    category: "sans-serif",
    designer: "Google Fonts",
    source: "google_fonts",
    fontFileUrl: "https://fonts.gstatic.com/s/oswald/v57/TK3_WkUHHAIjg75cFRf3bXL8LICs1_FvsUtiZTaR.woff2",
    fontFileFormat: "woff2",
    fontWeight: 400,
    previewText: "The quick brown fox",
    downloadUrl: "https://fonts.google.com/specimen/Oswald"
  },
  {
    id: "merriweather",
    name: "Merriweather",
    category: "serif",
    designer: "Google Fonts",
    source: "google_fonts",
    fontFileUrl: "https://fonts.gstatic.com/s/merriweather/v33/u-4D0qyriQwlOrhSvowK_l5UcA6zuSYEqOzpPe3HOZJ5eX1WtLaQwmYiScCmDxhtNOKl8yDr3icaGV31GvU.woff2",
    fontFileFormat: "woff2",
    fontWeight: 400,
    previewText: "The quick brown fox",
    downloadUrl: "https://fonts.google.com/specimen/Merriweather"
  },
  {
    id: "rubik",
    name: "Rubik",
    category: "sans-serif",
    designer: "Google Fonts",
    source: "google_fonts",
    fontFileUrl: "https://fonts.gstatic.com/s/rubik/v31/iJWZBXyIfDnIV5PNhY1KTN7Z-Yh-B4iFUkU1Z4Y.woff2",
    fontFileFormat: "woff2",
    fontWeight: 400,
    previewText: "The quick brown fox",
    downloadUrl: "https://fonts.google.com/specimen/Rubik"
  },
  {
    id: "poppins",
    name: "Poppins",
    category: "sans-serif",
    designer: "Google Fonts",
    source: "google_fonts",
    fontFileUrl: "https://fonts.gstatic.com/s/poppins/v24/pxiEyp8kv8JHgFVrJJbecmNE.woff2",
    fontFileFormat: "woff2",
    fontWeight: 400,
    previewText: "The quick brown fox",
    downloadUrl: "https://fonts.google.com/specimen/Poppins"
  },
  {
    id: "fira-sans",
    name: "Fira Sans",
    category: "sans-serif",
    designer: "Google Fonts",
    source: "google_fonts",
    fontFileUrl: "https://fonts.gstatic.com/s/firasans/v18/va9E4kDNxMZdWfMOD5VvmojLeTY.woff2",
    fontFileFormat: "woff2",
    fontWeight: 400,
    previewText: "The quick brown fox",
    downloadUrl: "https://fonts.google.com/specimen/Fira%20Sans"
  },
  {
    id: "space-mono",
    name: "Space Mono",
    category: "monospace",
    designer: "Google Fonts",
    source: "google_fonts",
    fontFileUrl: "https://fonts.gstatic.com/s/spacemono/v17/i7dPIFZifjKcF5UAWdDRYE58RWq7.woff2",
    fontFileFormat: "woff2",
    fontWeight: 400,
    previewText: "The quick brown fox",
    downloadUrl: "https://fonts.google.com/specimen/Space%20Mono"
  },
  {
    id: "share-tech-mono",
    name: "Share Tech Mono",
    category: "monospace",
    designer: "Google Fonts",
    source: "google_fonts",
    fontFileUrl: "https://fonts.gstatic.com/s/sharetechmono/v16/J7aHnp1uDWRBEqV98dVQztYldFcLowEF.woff2",
    fontFileFormat: "woff2",
    fontWeight: 400,
    previewText: "The quick brown fox",
    downloadUrl: "https://fonts.google.com/specimen/Share%20Tech%20Mono"
  },
  {
    id: "caveat",
    name: "Caveat",
    category: "handwriting",
    designer: "Google Fonts",
    source: "google_fonts",
    fontFileUrl: "https://fonts.gstatic.com/s/caveat/v23/WnznHAc5bAfYB2QRah7pcpNvOx-pjfJ9eIipYSxP.woff2",
    fontFileFormat: "woff2",
    fontWeight: 400,
    previewText: "The quick brown fox",
    downloadUrl: "https://fonts.google.com/specimen/Caveat"
  },
  {
    id: "pacifico",
    name: "Pacifico",
    category: "handwriting",
    designer: "Google Fonts",
    source: "google_fonts",
    fontFileUrl: "https://fonts.gstatic.com/s/pacifico/v23/FwZY7-Qmy14u9lezJ-6K6MmTpA.woff2",
    fontFileFormat: "woff2",
    fontWeight: 400,
    previewText: "The quick brown fox",
    downloadUrl: "https://fonts.google.com/specimen/Pacifico"
  },
  {
    id: "cinzel",
    name: "Cinzel",
    category: "serif",
    designer: "Google Fonts",
    source: "google_fonts",
    fontFileUrl: "https://fonts.gstatic.com/s/cinzel/v26/8vIU7ww63mVu7gtR-kwKxNvkNOjw-tbnfYPlDX5Z.woff2",
    fontFileFormat: "woff2",
    fontWeight: 400,
    previewText: "The quick brown fox",
    downloadUrl: "https://fonts.google.com/specimen/Cinzel"
  },
  {
    id: "cinzel-decorative",
    name: "Cinzel Decorative",
    category: "display",
    designer: "Google Fonts",
    source: "google_fonts",
    fontFileUrl: "https://fonts.gstatic.com/s/cinzeldecorative/v19/daaCSScvJGqLYhG8nNt8KPPswUAPni7dTMx7aA.woff2",
    fontFileFormat: "woff2",
    fontWeight: 400,
    previewText: "The quick brown fox",
    downloadUrl: "https://fonts.google.com/specimen/Cinzel%20Decorative"
  }
]

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

  let dateItems: any[] = []
  let popItems: any[] = []

  try {
    const [byDate, byPopularity] = await Promise.allSettled([
      fetchPool('date'),
      fetchPool('popularity'),
    ])

    if (byDate.status === 'rejected') console.warn('[google-fonts] date fetch failed:', byDate.reason)
    if (byPopularity.status === 'rejected') console.warn('[google-fonts] popularity fetch failed:', byPopularity.reason)

    dateItems = byDate.status === 'fulfilled' ? (byDate.value.items ?? []).slice(0, 100) : []
    popItems = byPopularity.status === 'fulfilled' ? (byPopularity.value.items ?? []).slice(0, 100) : []
  } catch (error) {
    console.warn('[google-fonts] fetch failed completely:', error)
  }

  let fontItems: FontItem[] = []

  if (dateItems.length === 0 && popItems.length === 0) {
    console.warn('[google-fonts] Google Fonts API returned no items or failed. Using curated static fallback list.')
    fontItems = GOOGLE_FONTS_FALLBACK
  } else {
    // Merge and deduplicate by family name
    const deduped = new Set<string>()
    const merged: any[] = []
    for (const item of [...dateItems, ...popItems]) {
      if (!deduped.has(item.family)) {
        deduped.add(item.family)
        merged.push(item)
      }
    }

    for (const font of merged) {
      let fileUrl = font.files?.regular || font.files?.['400'] || Object.values(font.files || {})[0]
      if (!fileUrl || typeof fileUrl !== 'string') continue

      fileUrl = fileUrl.replace(/^http:\/\//i, 'https://')

      fontItems.push({
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
    }
  }

  const results: FontItem[] = []
  for (const font of fontItems) {
    const seen = await isSeen('fonts', font.name)
    if (seen) continue

    results.push(font)
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
