import type { CSSProperties, ReactNode } from 'react'
import { ghostButton, ghostHover } from '../lib/styles'
import { useHover } from '../lib/useHover'

interface GhostButtonProps {
  onClick: () => void
  children: ReactNode
  extra?: CSSProperties
}

/** Low-emphasis outlined button used for row and panel actions. */
export function GhostButton({ onClick, children, extra }: GhostButtonProps) {
  const hover = useHover({ ...ghostButton, ...extra }, ghostHover)
  return (
    <button type="button" onClick={onClick} {...hover}>
      {children}
    </button>
  )
}
