import { useMemo, useState, type CSSProperties } from 'react'

/**
 * The design expresses hover as a style overlay rather than a CSS class, so
 * this merges the overlay in on pointer enter. Spread the result onto the
 * element: `<button {...useHover(base, ghostHover)}>`.
 */
export function useHover(base: CSSProperties, hover: CSSProperties) {
  const [on, setOn] = useState(false)
  const style = useMemo(() => (on ? { ...base, ...hover } : base), [on, base, hover])
  return {
    style,
    onMouseEnter: () => setOn(true),
    onMouseLeave: () => setOn(false),
  }
}
