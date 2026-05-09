import React from 'react'
import { FontItem } from '@/types'
import { env } from '@/lib/env'

export function FontSlide({ font }: { font: FontItem }) {
  const maxTitleSize = 250
  const titleSize = Math.min(maxTitleSize, Math.floor(1000 * 1.5 / font.name.length))
  
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        backgroundColor: '#1b1d20',
        fontFamily: font.name,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '50%',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          borderBottom: '2px solid #24252a',
        }}
      >
        <div
          style={{
            fontFamily: font.name,
            fontSize: 450,
            color: '#fbf7e2',
            lineHeight: 1.2,
            textAlign: 'center',
            display: 'flex',
          }}
        >
          Aa
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '50%',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            fontFamily: font.name,
            fontSize: titleSize,
            color: '#fbf7e2',
            lineHeight: 1.2,
            textAlign: 'center',
            display: 'flex',
          }}
        >
          {font.name}
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            left: 40,
            fontSize: 48,
            color: '#fbf7e2',
            display: 'flex',
            fontFamily: 'Inter',
          }}
        >
          {env.brandHandle}
        </div>
      </div>
    </div>
  )
}
