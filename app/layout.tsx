import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fonts.pace Dashboard',
  description: 'Instagram carousel generator for fonts and color palettes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', backgroundColor: '#f5f5f5' }}>
        {children}
      </body>
    </html>
  )
}
