import { env } from '@/lib/env'
import { DuotoneItem } from '@/types'

const CONTAINER_PADDING = 60
const CARD_GAP = 40
const CARD_RADIUS = 44
const CARD_PADDING = 48

function wrapText(text: string, maxLineLength: number) {
  const words = text.trim().split(/\s+/)
  if (words.length <= 1) return text

  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (next.length > maxLineLength && line) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines.join('\n')
}

function getTitleFontSize(label: string) {
  const lines = label.split('\n')
  const maxLen = Math.max(...lines.map(line => line.length))
  const lineCount = lines.length

  if (maxLen <= 10 && lineCount <= 2) return 140
  if (maxLen <= 14) return 120
  if (maxLen <= 18) return 105
  return 90
}

export function DuotoneTitleCard({ title, item }: { title: string; item?: DuotoneItem }) {
  const brandHandle = env.brandHandle
  const primary = item?.hex1 ?? '#111111'
  const secondary = item?.hex2 ?? '#f2f2f2'
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const wrappedTitle = wrapText(title, 12)
  const titleSize = getTitleFontSize(wrappedTitle)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        backgroundColor: '#ffffff',
        padding: `${CONTAINER_PADDING}px`,
        gap: `${CARD_GAP}px`,
        boxSizing: 'border-box',
        fontFamily: 'Jaro',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          flex: 1,
          backgroundColor: primary,
          color: secondary,
          borderRadius: `${CARD_RADIUS}px`,
          padding: `${CARD_PADDING}px`,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: titleSize,
            lineHeight: 1.05,
            maxWidth: '90%',
            whiteSpace: 'pre-wrap',
          }}
        >
          {wrappedTitle}
        </div>
        <div style={{ fontSize: 46, marginTop: 20, opacity: 0.9, letterSpacing: '0.04em' }}>
          {dateStr}
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          flex: 1,
          backgroundColor: secondary,
          color: primary,
          borderRadius: `${CARD_RADIUS}px`,
          padding: `${CARD_PADDING}px`,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 96, lineHeight: 1.05 }}>Swipe</div>
        <div style={{ fontSize: 52, marginTop: 16, opacity: 0.9 }}>{brandHandle}</div>
      </div>
    </div>
  )
}
