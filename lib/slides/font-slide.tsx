import React from 'react'
import { FontItem } from '@/types'
import { env } from '@/lib/env'

export function FontSlide({ font }: { font: FontItem }) {
  const brandHandle = env.brandHandle

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: 1080,
        height: 1080,
        backgroundColor: '#222222', // Dark top half
        fontFamily: font.name,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Half - Dark Background */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '52%',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {/* Top Left Concentric Circles */}
        <svg
          width="300"
          height="300"
          viewBox="0 0 300 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', top: -50, left: -50 }}
        >
          <circle cx="0" cy="0" r="280" stroke="#fcf8db" strokeWidth="4" fill="none" />
          <circle cx="0" cy="0" r="210" stroke="#fcf8db" strokeWidth="4" fill="none" />
          <circle cx="0" cy="0" r="140" stroke="#fcf8db" strokeWidth="4" fill="none" />
        </svg>

        {/* Bottom Right Grid Sphere (Top Half) */}
        <svg
          width="250"
          height="250"
          viewBox="0 0 250 250"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', bottom: -50, right: -50 }}
        >
          <circle cx="250" cy="250" r="200" stroke="#fcf8db" strokeWidth="4" fill="none" />
          <circle cx="250" cy="250" r="130" stroke="#fcf8db" strokeWidth="4" fill="none" />
          <path d="M 250 50 Q 150 150 50 250" stroke="#fcf8db" strokeWidth="4" fill="none" />
          <path d="M 250 120 Q 180 180 120 250" stroke="#fcf8db" strokeWidth="4" fill="none" />
        </svg>

        <div
          style={{
            fontFamily: font.name,
            fontSize: 240,
            color: '#fcf8db',
            lineHeight: 1,
            textAlign: 'center',
            display: 'flex',
            position: 'relative',
          }}
        >
          {font.name}
        </div>
      </div>

      {/* Bottom Half - Light Background */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '48%',
          backgroundColor: '#fcf8db',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {/* Top Left Grid Sphere (Bottom Half) */}
        <svg
          width="150"
          height="150"
          viewBox="0 0 150 150"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', top: -10, left: -10 }}
        >
          <circle cx="0" cy="0" r="120" stroke="#222222" strokeWidth="4" fill="none" />
          <circle cx="0" cy="0" r="70" stroke="#222222" strokeWidth="4" fill="none" />
          <path d="M 0 120 Q 60 60 120 0" stroke="#222222" strokeWidth="4" fill="none" />
          <path d="M 0 70 Q 35 35 70 0" stroke="#222222" strokeWidth="4" fill="none" />
        </svg>

        {/* Bottom Right Diagonal Lines */}
        <svg
          width="300"
          height="300"
          viewBox="0 0 300 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', bottom: 20, right: 20 }}
        >
          <line x1="100" y1="300" x2="300" y2="100" stroke="#222222" strokeWidth="6" />
          <line x1="150" y1="300" x2="300" y2="150" stroke="#222222" strokeWidth="6" />
          <line x1="200" y1="300" x2="300" y2="200" stroke="#222222" strokeWidth="6" />
        </svg>

        <div
          style={{
            fontFamily: font.name,
            fontSize: 160,
            color: '#222222',
            lineHeight: 1.2,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          <span style={{ display: 'flex' }}>Font</span>
          <span style={{ display: 'flex' }}>styles</span>
        </div>

        {/* Bottom Left Branding */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            left: 40,
            fontSize: 32,
            color: '#222222',
            fontFamily: 'Inter',
            fontWeight: 500,
            display: 'flex',
          }}
        >
          {brandHandle}
        </div>
      </div>
    </div>
  )
}
