/**
 * All record timestamps in the demo dataset are stored as "minutes ago", so
 * every displayed date is derived from a single reference instant captured
 * once at load. Keeping it fixed stops the clock, the activity feed and the
 * email log from drifting apart between renders.
 */
export const NOW = Date.now()

/** "just now" / "42m ago" / "2h 10m ago" / "3 days ago" */
export function ago(m: number): string {
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  if (m < 1440) {
    const h = Math.floor(m / 60)
    const r = m % 60
    return `${h}h${r ? ` ${r}m` : ''} ago`
  }
  const d = Math.floor(m / 1440)
  return `${d}${d === 1 ? ' day ago' : ' days ago'}`
}

/** Bare duration: "42m" / "2h 10m" / "3d" */
export function span(m: number): string {
  if (m < 60) return `${m}m`
  if (m < 1440) {
    const h = Math.floor(m / 60)
    const r = m % 60
    return `${h}h${r ? ` ${r}m` : ''}`
  }
  return `${Math.floor(m / 1440)}d`
}

function at(m: number): Date {
  return new Date(NOW - m * 60000)
}

/** "Mar 4, 9:15 AM" */
export function short(m: number): string {
  return at(m).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/** "Mar 4, 2026, 9:15 AM" */
export function full(m: number): string {
  return at(m).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/** "9:15 AM" */
export function hhmm(m: number): string {
  return at(m).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' })
}

/** "Wed, Mar 4, 9:15 AM" — the header clock. */
export function clockLabel(): string {
  return new Date(NOW).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
