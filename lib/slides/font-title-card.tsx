import { env } from '@/lib/env'

export function FontTitleCard() {
  const brandHandle = env.brandHandle

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        fontFamily: 'Jaro',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '50%',
          backgroundColor: '#1b1d20',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <svg
          width="300"
          height="300"
          viewBox="0 0 300 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', top: -50, left: -50 }}
        >
          <circle cx="0" cy="0" r="280" stroke="#fbf7e2" strokeWidth="4" fill="none" />
          <circle cx="0" cy="0" r="210" stroke="#fbf7e2" strokeWidth="4" fill="none" />
          <circle cx="0" cy="0" r="140" stroke="#fbf7e2" strokeWidth="4" fill="none" />
        </svg>

        <svg
          width="250"
          height="250"
          viewBox="0 0 250 250"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', bottom: -50, right: -50 }}
        >
          <circle cx="250" cy="250" r="200" stroke="#fbf7e2" strokeWidth="4" fill="none" />
          <circle cx="250" cy="250" r="130" stroke="#fbf7e2" strokeWidth="4" fill="none" />
          <line x1="50" y1="250" x2="250" y2="50" stroke="#fbf7e2" strokeWidth="4" />
          <line x1="120" y1="250" x2="250" y2="120" stroke="#fbf7e2" strokeWidth="4" />
          <line x1="190" y1="250" x2="250" y2="190" stroke="#fbf7e2" strokeWidth="4" />
          <line x1="250" y1="250" x2="250" y2="50" stroke="#fbf7e2" strokeWidth="4" />
          <line x1="250" y1="250" x2="50" y2="250" stroke="#fbf7e2" strokeWidth="4" />
        </svg>

        <div
          style={{
            fontSize: 320,
            color: '#fbf7e2',
            lineHeight: 1,
            textAlign: 'center',
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
          height: '50%',
          backgroundColor: '#fbf7e2',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <svg
          width="150"
          height="150"
          viewBox="0 0 150 150"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', top: -10, left: -60 }}
        >
          <circle cx="0" cy="0" r="120" stroke="#1b1d20" strokeWidth="4" fill="none" />
          <circle cx="0" cy="0" r="70" stroke="#1b1d20" strokeWidth="4" fill="none" />
          <line x1="0" y1="120" x2="120" y2="0" stroke="#1b1d20" strokeWidth="4" />
          <line x1="0" y1="70" x2="70" y2="0" stroke="#1b1d20" strokeWidth="4" />
        </svg>

        <svg
          width="300"
          height="300"
          viewBox="0 0 300 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', bottom: 20, right: 20 }}
        >
          <line x1="100" y1="300" x2="300" y2="100" stroke="#1b1d20" strokeWidth="10" />
          <line x1="180" y1="300" x2="300" y2="180" stroke="#1b1d20" strokeWidth="10" />
          <line x1="260" y1="300" x2="300" y2="260" stroke="#1b1d20" strokeWidth="10" />
        </svg>

        <div
          style={{
            fontSize: 240,
            color: '#1b1d20',
            lineHeight: 1.2,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <span style={{ display: 'flex' }}>Font</span>
          <span style={{ display: 'flex' }}>styles</span>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 40,
            left: 40,
            fontSize: 48,
            fontFamily: 'Inter',
            color: '#1b1d20',
            display: 'flex',
          }}
        >
          {brandHandle}
        </div>
      </div>
    </div>
  )
}
