import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { put } from '@vercel/blob'
import { ReactNode } from 'react'
import fs from 'fs'
import path from 'path'

export type SatoriFont = {
  name: string
  data: ArrayBuffer
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
  style?: 'normal' | 'italic'
}

let defaultFontData: ArrayBuffer | null = null;
function getDefaultFont(): ArrayBuffer {
  if (!defaultFontData) {
    const buf = fs.readFileSync(path.join(process.cwd(), 'public', 'fonts', 'fallback.ttf'));
    defaultFontData = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
  }
  return defaultFontData;
}

export async function renderSlide(jsx: ReactNode, customFonts: SatoriFont[] = []): Promise<Buffer> {
  const fonts = [...customFonts, { name: 'Inter', data: getDefaultFont(), weight: 400 as const }];

  const svg = await satori(jsx as any, {
    width: 1080,
    height: 1080,
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
