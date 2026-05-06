import { FontItem } from '@/types'
import { env } from '@/lib/env'

export function FontSlide({ font }: { font: FontItem }) {
  const brandHandle = env.brandHandle

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: 1080,
        height: 1080,
        backgroundColor: '#ffffff',
        padding: '60px',
        fontFamily: font.name,
      }}
    >
      {/* Top 65%: font name in enormous text */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        <div
          style={{
            fontFamily: font.name,
            fontSize: 110,
            fontWeight: 700,
            color: '#111111',
            lineHeight: 1.1,
            letterSpacing: '-2px',
          }}
        >
          {font.name}
        </div>
        <div
          style={{
            fontFamily: font.name,
            fontSize: 32,
            color: '#333333',
            marginTop: 32,
          }}
        >
          Aa Bb Cc — The quick brown fox
        </div>
      </div>

      {/* Bottom strip */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginTop: 'auto',
        }}
      >
        <div
          style={{
            fontSize: 16,
            color: '#888888',
            display: 'flex',
          }}
        >
          {`${font.category || 'Sans'} · ${font.designer || 'Unknown'}`}
        </div>
        <div
          style={{
            fontSize: 14,
            color: '#aaaaaa',
          }}
        >
          {brandHandle}
        </div>
      </div>
    </div>
  )
}
