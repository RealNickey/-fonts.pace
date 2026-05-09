export type FontItem = {
  id: string
  name: string
  category: 'serif' | 'sans-serif' | 'display' | 'monospace' | 'handwriting'
  designer: string
  source: 'google_fonts' | 'fontshare'
  fontFileUrl: string
  fontFileFormat?: string
  fontWeight?: number
  fontStyle?: string
  previewText: string
  downloadUrl: string
}

export type PaletteItem = {
  id: string
  colors: string[]
  colorNames: string[]
  source: 'colorhunt'
  sourceUrl: string
  likes: number
}

export type DuotoneItem = {
  id: string
  name1: string
  hex1: string
  name2: string
  hex2: string
}

export type Post = {
  id: string
  type: 'fonts' | 'palettes' | 'duotone'
  title: string
  items: (FontItem | PaletteItem | DuotoneItem)[]
  slideUrls: string[]
  caption: string
  status: 'pending' | 'published' | 'rejected'
  createdAt: string
  publishedAt?: string
  igMediaId?: string
}
