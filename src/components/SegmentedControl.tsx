import { C } from '../lib/styles'

interface SegmentedControlProps<T extends string> {
  label: string
  value: T
  options: readonly T[]
  onChange: (v: T) => void
}

/**
 * Display toggle. The prototype exposed table density and map fill as
 * design-tool props; here they are real controls so a reviewer can try both.
 */
export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
      <span
        style={{
          font: '400 10.5px/1.3 "IBM Plex Sans",sans-serif',
          letterSpacing: '.08em',
          textTransform: 'uppercase',
          color: C.faint,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
      <div
        role="group"
        aria-label={label}
        style={{
          display: 'inline-flex',
          border: '1px solid #dcd9d2',
          borderRadius: '3px',
          overflow: 'hidden',
          background: C.surface,
        }}
      >
        {options.map((o, i) => {
          const on = o === value
          return (
            <button
              key={o}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(o)}
              style={{
                padding: '5px 11px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                border: 'none',
                borderLeft: i ? '1px solid #dcd9d2' : 'none',
                font: `${on ? '500' : '400'} 11.5px/1.3 "IBM Plex Sans",sans-serif`,
                background: on ? C.navy : 'transparent',
                color: on ? '#fff' : C.body,
              }}
            >
              {o}
            </button>
          )
        })}
      </div>
    </div>
  )
}
