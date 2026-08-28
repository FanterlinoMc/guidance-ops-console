import type { CSSProperties } from 'react'
import type { ToneName } from '../types'

/* ---------- palette ---------- */

export const C = {
  ink: '#12212f',
  navy: '#0b2545',
  link: '#16375e',
  body: '#3c4c5b',
  muted: '#6b7a89',
  faint: '#8a97a3',
  ghost: '#a8b1ba',
  page: '#f6f5f2',
  surface: '#fff',
  sunken: '#fbfaf8',
  panel: '#f7f6f2',
  line: '#e5e3de',
  hair: '#f1efea',
  gold: '#e0a83c',
} as const

/* ---------- tones ---------- */

interface Tone {
  color: string
  background: string
  border: string
  dot: string
}

export const TONES: Record<ToneName, Tone> = {
  urgent: { color: '#8f1d16', background: '#fbeeec', border: '1px solid #eed3ce', dot: '#b3291f' },
  attention: { color: '#79511a', background: '#fdf5e6', border: '1px solid #eee0c2', dot: '#c08a17' },
  settled: { color: '#1c6249', background: '#eaf3ee', border: '1px solid #d1e3d9', dot: '#2b7a5c' },
  info: { color: '#2f5480', background: '#eef2f8', border: '1px solid #d8e0ec', dot: '#4573ab' },
  neutral: { color: '#4b5b6a', background: '#f3f2ed', border: '1px solid #e4e2db', dot: '#8a97a3' },
  plain: { color: '#5b6b7a', background: 'transparent', border: '1px solid #e4e2db', dot: '#a8b1ba' },
}

export function tone(name: ToneName): Tone {
  return TONES[name] ?? TONES.neutral
}

/* ---------- primitives ---------- */

export function pill(name: ToneName, extra?: CSSProperties): CSSProperties {
  const t = tone(name)
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '3px 8px',
    borderRadius: '3px',
    font: '500 11.5px/1.4 "IBM Plex Sans",sans-serif',
    whiteSpace: 'nowrap',
    color: t.color,
    background: t.background,
    border: t.border,
    ...extra,
  }
}

export function dot(name: ToneName): CSSProperties {
  return { width: '6px', height: '6px', borderRadius: '50%', background: tone(name).dot, flex: '0 0 6px' }
}

export function chip(active: boolean): CSSProperties {
  return {
    padding: '6px 11px',
    borderRadius: '3px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    font: `${active ? '500' : '400'} 12px/1.3 "IBM Plex Sans",sans-serif`,
    background: active ? C.navy : C.surface,
    color: active ? '#fff' : C.body,
    border: `1px solid ${active ? C.navy : '#dcd9d2'}`,
  }
}

/* ---------- hovers ---------- */

export const ghostHover: CSSProperties = { background: '#f4f3ee' }
export const rowHover: CSSProperties = { background: '#faf9f6' }
export const navHover: CSSProperties = { background: 'rgba(255,255,255,.07)', color: '#fff' }

/* ---------- table ---------- */

export const cellBase: CSSProperties = {
  padding: '12px',
  verticalAlign: 'top',
  font: '400 12.5px/1.45 "IBM Plex Sans",sans-serif',
  color: C.body,
}

export const cellMonoBase: CSSProperties = {
  padding: '12px',
  verticalAlign: 'top',
  font: '400 12.5px/1.45 "IBM Plex Mono",monospace',
  color: C.body,
  whiteSpace: 'nowrap',
}

export const headStyle: CSSProperties = {
  textAlign: 'left',
  padding: '14px 12px 10px',
  font: '500 10px/1.3 "IBM Plex Sans",sans-serif',
  letterSpacing: '.1em',
  textTransform: 'uppercase',
  color: C.faint,
  borderBottom: `1px solid ${C.line}`,
  whiteSpace: 'nowrap',
}

/* ---------- shared blocks ---------- */

export const card: CSSProperties = {
  background: C.surface,
  border: `1px solid ${C.line}`,
  borderRadius: '5px',
}

export const h2Serif: CSSProperties = {
  margin: 0,
  font: '500 15px/1.3 "IBM Plex Serif",Georgia,serif',
  color: C.navy,
}

export const h3Serif: CSSProperties = {
  margin: 0,
  font: '500 14px/1.3 "IBM Plex Serif",Georgia,serif',
  color: C.navy,
}

export const eyebrowBold: CSSProperties = {
  font: '600 10px/1.3 "IBM Plex Sans",sans-serif',
  letterSpacing: '.1em',
  textTransform: 'uppercase',
  color: C.muted,
}

export const microLabel: CSSProperties = {
  font: '400 10.5px/1.3 "IBM Plex Sans",sans-serif',
  letterSpacing: '.08em',
  textTransform: 'uppercase',
  color: C.faint,
}

/** Definition-list value styles, with a distinct treatment for missing data. */
export const fieldValue: CSSProperties = {
  font: '400 12.5px/1.5 "IBM Plex Sans",sans-serif',
  color: C.ink,
  margin: 0,
}
export const fieldMono: CSSProperties = {
  font: '400 12.5px/1.5 "IBM Plex Mono",monospace',
  color: C.ink,
  margin: 0,
  wordBreak: 'break-all',
}
export const fieldMissing: CSSProperties = {
  font: '400 12.5px/1.5 "IBM Plex Sans",sans-serif',
  color: '#79511a',
  margin: 0,
}

export const ghostButton: CSSProperties = {
  background: 'none',
  border: `1px solid ${C.line}`,
  borderRadius: '3px',
  padding: '5px 10px',
  font: '500 11.5px/1.3 "IBM Plex Sans",sans-serif',
  color: C.link,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
}

export const primaryButton: CSSProperties = {
  background: C.navy,
  border: `1px solid ${C.navy}`,
  borderRadius: '3px',
  padding: '8px 14px',
  font: '500 12px/1.3 "IBM Plex Sans",sans-serif',
  color: '#fff',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
}

/** Hatch fill marking a state with no Concierge coverage. */
export const HATCH = 'repeating-linear-gradient(45deg,#f1efe9 0 3px,#e4e1d8 3px 6px)'
