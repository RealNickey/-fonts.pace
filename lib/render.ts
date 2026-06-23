import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { put } from '@vercel/blob'
import { ReactNode } from 'react'
import fs from 'fs'
import path from 'path'
import { decompress } from 'wawoff2'
import dns from 'dns'

dns.setDefaultResultOrder('ipv4first')

export type SatoriFont = {
  name: string
  data: ArrayBuffer
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
  style?: 'normal' | 'italic'
}

const ALLOWED_FONT_HOSTS = ['fonts.gstatic.com', 'api.fontshare.com', 'cdn.fontshare.com']
const fontBufferCache = new Map<string, ArrayBuffer>()

export function getSafeFontUrl(rawUrl: string): URL | null {
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

export async function fetchRenderFont(fontUrl: string): Promise<ArrayBuffer | undefined> {
  const safeUrl = getSafeFontUrl(fontUrl)
  if (!safeUrl) return undefined

  const urlStr = safeUrl.toString()
  if (fontBufferCache.has(urlStr)) return fontBufferCache.get(urlStr)
  
  try {
    const res = await fetch(urlStr)
    if (!res.ok) return undefined
    
    const arrayBuffer = await res.arrayBuffer()
    
    // Check if WOFF2 (signature 'wOF2') — decompress to TTF for Satori
    const view = new DataView(arrayBuffer)
    if (view.byteLength >= 4) {
      const magic = view.getUint32(0)
      if (magic === 0x774F4632) { // 'wOF2'
        try {
          console.log(`[render] Decompressing WOFF2: ${fontUrl}`)
          const ttfBuffer = await decompress(Buffer.from(arrayBuffer))
          const decompressed = ttfBuffer.buffer.slice(
            ttfBuffer.byteOffset,
            ttfBuffer.byteOffset + ttfBuffer.byteLength
          ) as ArrayBuffer
          fontBufferCache.set(urlStr, decompressed)
          return decompressed
        } catch (err) {
          console.warn(`[render] Failed to decompress WOFF2, skipping: ${fontUrl}`, err)
          return undefined
        }
      }
    }
    
    fontBufferCache.set(urlStr, arrayBuffer)
    return arrayBuffer
  } catch (error) {
    console.error(`Failed to fetch font: ${fontUrl}`, error)
    return undefined
  }
}

let defaultFontData: ArrayBuffer | null = null;
function getDefaultFont(): ArrayBuffer {
  if (!defaultFontData) {
    const buf = fs.readFileSync(path.join(process.cwd(), 'public', 'fonts', 'fallback.ttf'));
    defaultFontData = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
  }
  return defaultFontData;
}

export async function renderSlide(jsx: ReactNode, customFonts: SatoriFont[] = [], height = 1080): Promise<Buffer> {
  const fonts = [...customFonts, { name: 'Inter', data: getDefaultFont(), weight: 400 as const }];

  const svg = await satori(jsx as any, {
    width: 1080,
    height,
    fonts,
  })
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1080 } })
  return Buffer.from(resvg.render().asPng())
}

export async function uploadSlide(buffer: Buffer, filename: string): Promise<string> {
  const blob = await put(filename, buffer, {
    access: 'public',
    contentType: 'image/png',
  })
  return blob.url
}

/**
 * Ensures a static asset (like first/last pages) is uploaded and returns its URL.
 * Uses a deterministic path in Blob storage to "cache" the file.
 */
export async function getStaticAssetUrl(assetName: string): Promise<string> {
  // Trick Vercel NFT compiler to trace and bundle these files.
  // By referencing them as static paths, Next.js includes them in the serverless bundle.
  if ((process.env.NODE_ENV as string) === 'test-build-trace') {
    path.join(process.cwd(), 'public/assets/first-page.png')
    path.join(process.cwd(), 'public/assets/last-page.png')
    path.join(process.cwd(), 'public/assets/font-first.png')
    path.join(process.cwd(), 'public/assets/font-last.png')
  }

  const filePath = path.join(process.cwd(), 'public', 'assets', assetName)
  let buffer: Buffer

  try {
    buffer = fs.readFileSync(filePath)
  } catch (error) {
    console.warn(`[getStaticAssetUrl] Failed to read local file ${filePath}, falling back to HTTP fetch. Error:`, error)
    
    let host = process.env.VERCEL_URL
    let proto = 'https'
    
    try {
      const { headers } = await import('next/headers')
      const headersList = await headers()
      const reqHost = headersList.get('x-forwarded-host') ?? headersList.get('host')
      if (reqHost) {
        host = reqHost
        proto = headersList.get('x-forwarded-proto') ?? (host.includes('localhost') ? 'http' : 'https')
      }
    } catch (e) {
      // outside request context or not in next.js environment
    }

    if (!host) {
      host = 'localhost:3000'
      proto = 'http'
    }

    const assetUrl = `${proto}://${host}/assets/${assetName}`
    console.log(`[getStaticAssetUrl] Fetching static asset via HTTP: ${assetUrl}`)
    const res = await fetch(assetUrl)
    if (!res.ok) {
      throw new Error(`Failed to fetch static asset from URL: ${assetUrl} (Status: ${res.status})`)
    }
    const arrayBuffer = await res.arrayBuffer()
    buffer = Buffer.from(arrayBuffer)
  }
  
  // We use a fixed filename in a 'static' folder to avoid re-uploading if possible,
  // though put() will overwrite or create a new version.
  const blob = await put(`static/${assetName}`, buffer, {
    access: 'public',
    contentType: 'image/png',
    addRandomSuffix: false, // Important for "stable" URLs
    allowOverwrite: true,
  })
  return blob.url
}
