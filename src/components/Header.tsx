import { clockLabel } from '../lib/time'

interface HeaderProps {
  title: string
  subtitle: string
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 5,
        background: 'rgba(246,245,242,.94)',
        backdropFilter: 'blur(6px)',
        borderBottom: '1px solid #e5e3de',
        padding: '22px 34px 18px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '24px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h1
            style={{
              margin: 0,
              font: "500 25px/1.2 'IBM Plex Serif',Georgia,serif",
              letterSpacing: '-0.012em',
              color: '#0b2545',
            }}
          >
            {title}
          </h1>
          <p
            style={{
              margin: '6px 0 0',
              font: "400 13px/1.5 'IBM Plex Sans',sans-serif",
              color: '#6b7a89',
              maxWidth: '76ch',
            }}
          >
            {subtitle}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 9px',
              border: '1px solid #e0cfa8',
              background: '#fdf7e8',
              borderRadius: '3px',
              font: "500 11px/1.3 'IBM Plex Sans',sans-serif",
              color: '#7a5000',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#c08a17' }} />
            Demo data — sample records
          </span>
          <span style={{ font: "400 11.5px/1.3 'IBM Plex Mono',monospace", color: '#8a97a3' }}>
            {clockLabel()}
          </span>
        </div>
      </div>
    </header>
  )
}
