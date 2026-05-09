import { env } from '@/lib/env'
import { DuotoneItem } from '@/types'
import fs from 'fs'
import path from 'path'

export function DuotoneCTACard({ item }: { item?: DuotoneItem }) {
  const imagePath = path.join(process.cwd(), 'public', 'assets', 'last-page.png')
  let base64 = ''
  try {
    const imageBuffer = fs.readFileSync(imagePath)
    base64 = `data:image/png;base64,${imageBuffer.toString('base64')}`
  } catch (err) {
    console.error('Failed to read last-page.png', err)
  }

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        backgroundColor: '#ffffff',
      }}
    >
      {base64 && (
        <img
          src={base64}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      )}
    </div>
  )
}
