import { env } from '@/lib/env'

export function CTACard() {
  const brandHandle = env.brandHandle

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        backgroundColor: '#111111',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          fontSize: 48,
          fontWeight: 700,
          color: '#ffffff',
          textAlign: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        Follow for more
      </div>
      <div
        style={{
          fontSize: 32,
          color: '#7c3aed',
          marginTop: 24,
          fontFamily: 'sans-serif',
        }}
      >
        {brandHandle}
      </div>
    </div>
  )
}
