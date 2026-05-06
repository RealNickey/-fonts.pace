import { DuotoneItem } from '@/types'

const CONTAINER_PADDING = 60
const CARD_GAP = 40
const CARD_RADIUS = 44
const CARD_PADDING = 48

function wrapName(name: string, maxLineLength: number) {
  const words = name.trim().split(/\s+/)
  if (words.length <= 1) return name

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

function getNameFontSize(label: string) {
  const lines = label.split('\n')
  const maxLen = Math.max(...lines.map(line => line.length))
  const lineCount = lines.length

  if (maxLen <= 8 && lineCount <= 2) return 170
  if (maxLen <= 12) return 150
  if (maxLen <= 16) return 130
  if (maxLen <= 20) return 115
  return 100
}

function getHexFontSize(nameSize: number) {
  return Math.max(40, Math.floor(nameSize * 0.3))
}

export function DuotoneSlide({ item }: { item: DuotoneItem }) {
  const name1 = wrapName(item.name1, 12)
  const name2 = wrapName(item.name2, 12)
  const name1Size = getNameFontSize(name1)
  const name2Size = getNameFontSize(name2)
  const hex1Size = getHexFontSize(name1Size)
  const hex2Size = getHexFontSize(name2Size)

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
          backgroundColor: item.hex1,
          color: item.hex2,
          borderRadius: `${CARD_RADIUS}px`,
          padding: `${CARD_PADDING}px`,
        }}
      >
        <div
          style={{
            fontSize: name1Size,
            lineHeight: 1.05,
            textAlign: 'center',
            textTransform: 'capitalize',
            maxWidth: '90%',
            whiteSpace: 'pre-wrap',
          }}
        >
          {name1}
        </div>
        <div
          style={{
            fontSize: hex1Size,
            marginTop: 18,
            opacity: 0.9,
            letterSpacing: '0.06em',
          }}
        >
          {item.hex1}
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
          backgroundColor: item.hex2,
          color: item.hex1,
          borderRadius: `${CARD_RADIUS}px`,
          padding: `${CARD_PADDING}px`,
        }}
      >
        <div
          style={{
            fontSize: name2Size,
            lineHeight: 1.05,
            textAlign: 'center',
            textTransform: 'capitalize',
            maxWidth: '90%',
            whiteSpace: 'pre-wrap',
          }}
        >
          {name2}
        </div>
        <div
          style={{
            fontSize: hex2Size,
            marginTop: 18,
            opacity: 0.9,
            letterSpacing: '0.06em',
          }}
        >
          {item.hex2}
        </div>
      </div>
    </div>
  )
}
