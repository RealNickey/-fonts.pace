import { env } from '@/lib/env'

export function TitleCard({ title }: { title: string }) {
  const brandHandle = env.brandHandle

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        backgroundColor: '#fbf7e2',
        fontFamily: 'Jaro',
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '50%',
          backgroundColor: '#242424',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top Left Rings */}
        <svg style={{ position: 'absolute', top: 0, left: 0, display: 'flex' }} width="250" height="250" viewBox="0 0 250 250" fill="none">
          <circle cx="0" cy="0" r="100" stroke="#fbf7e2" strokeWidth="4" />
          <circle cx="0" cy="0" r="150" stroke="#fbf7e2" strokeWidth="4" />
          <circle cx="0" cy="0" r="200" stroke="#fbf7e2" strokeWidth="4" />
        </svg>

        {/* Top Right Radar */}
        <svg style={{ position: 'absolute', top: '50%', right: -100, transform: 'translateY(-50%)', display: 'flex' }} width="300" height="300" viewBox="0 0 300 300" fill="none">
          <circle cx="150" cy="150" r="80" stroke="#fbf7e2" strokeWidth="4" />
          <circle cx="150" cy="150" r="130" stroke="#fbf7e2" strokeWidth="4" />
          <path d="M150 0 L150 300 M0 150 L300 150 M44 44 L256 256 M44 256 L256 44" stroke="#fbf7e2" strokeWidth="4" />
        </svg>

        <div
          style={{
            fontSize: 240,
            color: '#fbf7e2',
            textAlign: 'center',
            lineHeight: 1,
            zIndex: 10,
            display: 'flex',
          }}
        >
          Figma
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '50%',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Middle Left Grid */}
        <svg style={{ position: 'absolute', top: -100, left: -50, display: 'flex' }} width="200" height="200" viewBox="0 0 200 200" fill="none">
          <path d="M100 0 L100 200 M0 100 L200 100 M30 30 L170 170 M30 170 L170 30" stroke="#242424" strokeWidth="4" />
          <circle cx="100" cy="100" r="80" stroke="#242424" strokeWidth="4" />
        </svg>

        {/* Bottom Right Parallel Diagonal Lines */}
        <svg style={{ position: 'absolute', bottom: 20, right: 20, display: 'flex' }} width="200" height="200" viewBox="0 0 200 200" fill="none">
          <line x1="0" y1="200" x2="200" y2="0" stroke="#242424" strokeWidth="6" />
          <line x1="50" y1="200" x2="200" y2="50" stroke="#242424" strokeWidth="6" />
          <line x1="100" y1="200" x2="200" y2="100" stroke="#242424" strokeWidth="6" />
        </svg>

        <div
          style={{
            fontSize: 200,
            color: '#242424',
            textAlign: 'center',
            lineHeight: 1.1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex' }}>Font</div>
          <div style={{ display: 'flex' }}>styles</div>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 40,
            left: 40,
            fontSize: 48,
            color: '#242424',
            fontFamily: 'Inter',
            display: 'flex',
          }}
        >
          {brandHandle}
        </div>
      </div>
    </div>
  )
}
