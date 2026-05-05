'use client'

import { useFormStatus } from 'react-dom'
import { ReactNode } from 'react'

export function SubmitButton({
  children,
  pendingText,
  style
}: {
  children: ReactNode,
  pendingText: string,
  style?: React.CSSProperties
}) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        ...style,
        opacity: pending ? 0.7 : 1,
        cursor: pending ? 'not-allowed' : 'pointer'
      }}
      aria-disabled={pending}
    >
      {pending ? pendingText : children}
    </button>
  )
}
