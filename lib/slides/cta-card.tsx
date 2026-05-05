export function CTACard() {
  const brandHandle = process.env.NEXT_PUBLIC_BRAND_HANDLE ?? '@fontspace'

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: 1080,
        height: 1080,
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
