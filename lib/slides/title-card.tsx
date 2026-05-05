export function TitleCard({ title }: { title: string }) {
  const brandHandle = process.env.NEXT_PUBLIC_BRAND_HANDLE ?? '@fontspace'
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: 1080,
        height: 1080,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '80px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: '#111111',
            textAlign: 'center',
            lineHeight: 1.2,
            fontFamily: 'sans-serif',
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 24,
            color: '#888888',
            marginTop: 24,
            fontFamily: 'sans-serif',
          }}
        >
          {dateStr}
        </div>
      </div>
      <div
        style={{
          fontSize: 14,
          color: '#aaaaaa',
          fontFamily: 'sans-serif',
          alignSelf: 'flex-end',
        }}
      >
        {brandHandle}
      </div>
    </div>
  )
}
