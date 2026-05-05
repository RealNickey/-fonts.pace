export type FontItem = {
  id: string
  name: string
  category: 'serif' | 'sans-serif' | 'display' | 'monospace' | 'handwriting'
  designer: string
  source: 'google_fonts' | 'fontshare'
  fontFileUrl: string
  previewText: string
  downloadUrl: string
}

export type PaletteItem = {
  id: string
  colors: string[]
  source: 'colorhunt'
  sourceUrl: string
  likes: number
}

export type Post = {
  id: string
  type: 'fonts' | 'palettes'
  title: string
  items: (FontItem | PaletteItem)[]
  slideUrls: string[]
  caption: string
  status: 'pending' | 'published' | 'rejected'
  createdAt: string
  publishedAt?: string
  igMediaId?: string
}
