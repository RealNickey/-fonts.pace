import { PaletteItem } from '@/types'
import { env } from '@/lib/env'

function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5
}

export function PaletteSlide({ palette }: { palette: PaletteItem }) {
  const brandHandle = env.brandHandle
  const n = palette.colors.length
  const blockWidth = Math.floor(1080 / n)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: 1080,
        height: 1080,
        backgroundColor: '#f9f9f9',
      }}
    >
      {/* Color blocks */}
      <div style={{ display: 'flex', flexDirection: 'row', flex: 1 }}>
        {palette.colors.map((color, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              width: blockWidth,
              height: 580,
              backgroundColor: color,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontSize: 18,
                color: isLightColor(color) ? '#111111' : '#ffffff',
                fontFamily: 'sans-serif',
              }}
            >
              {color.toUpperCase()}
            </span>
          </div>
        ))}
      </div>

      {/* Hex codes row */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          padding: '24px 40px',
          gap: 32,
          flexWrap: 'wrap',
        }}
      >
        {palette.colors.map((color, i) => (
          <span
            key={i}
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: color,
              fontFamily: 'sans-serif',
            }}
          >
            {color.toUpperCase()}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 40px',
        }}
      >
        <span style={{ fontSize: 14, color: '#888888', fontFamily: 'sans-serif' }}>
          via colorhunt
        </span>
        <span style={{ fontSize: 14, color: '#aaaaaa', fontFamily: 'sans-serif' }}>
          {brandHandle}
        </span>
      </div>
    </div>
  )
}
