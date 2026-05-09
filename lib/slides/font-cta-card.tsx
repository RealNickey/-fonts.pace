import { env } from '@/lib/env'

export function FontCTACard() {
  const brandHandle = env.brandHandle

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        backgroundColor: '#1b1d20',
        fontFamily: 'Jaro',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
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
        width="300"
        height="300"
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', top: 300, right: -100 }}
      >
        <circle cx="150" cy="150" r="150" stroke="#fbf7e2" strokeWidth="4" fill="none" />
        <circle cx="150" cy="150" r="100" stroke="#fbf7e2" strokeWidth="4" fill="none" />
        <circle cx="150" cy="150" r="50" stroke="#fbf7e2" strokeWidth="4" fill="none" />
        <line x1="150" y1="0" x2="150" y2="300" stroke="#fbf7e2" strokeWidth="4" />
        <line x1="0" y1="150" x2="300" y2="150" stroke="#fbf7e2" strokeWidth="4" />
        <line x1="44" y1="44" x2="256" y2="256" stroke="#fbf7e2" strokeWidth="4" />
        <line x1="44" y1="256" x2="256" y2="44" stroke="#fbf7e2" strokeWidth="4" />
      </svg>

      <svg
        width="300"
        height="300"
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', bottom: 20, right: 20 }}
      >
        <line x1="100" y1="300" x2="300" y2="100" stroke="#fbf7e2" strokeWidth="10" />
        <line x1="180" y1="300" x2="300" y2="180" stroke="#fbf7e2" strokeWidth="10" />
        <line x1="260" y1="300" x2="300" y2="260" stroke="#fbf7e2" strokeWidth="10" />
      </svg>

      <div
        style={{
          fontSize: 260,
          color: '#fbf7e2',
          lineHeight: 1.2,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 10,
        }}
      >
        <span style={{ display: 'flex' }}>Follow</span>
        <span style={{ display: 'flex' }}>for</span>
        <span style={{ display: 'flex' }}>More</span>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 40,
          left: 40,
          fontSize: 48,
          fontFamily: 'Inter',
          color: '#fbf7e2',
          display: 'flex',
        }}
      >
        {brandHandle}
      </div>
    </div>
  )
}
