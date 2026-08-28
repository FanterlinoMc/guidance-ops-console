import type { Screen } from '../types'
import { navHover } from '../lib/styles'
import { useHover } from '../lib/useHover'

interface NavDef {
  id: Screen
  label: string
  sub: string
  badge: string
}

interface SidebarProps {
  screen: Screen
  onNavigate: (s: Screen) => void
  leadCount: number
  breachCount: number
  regionCount: number
}

function NavItem({
  item,
  active,
  onClick,
}: {
  item: NavDef
  active: boolean
  onClick: () => void
}) {
  const hover = useHover(
    {
      display: 'flex',
      alignItems: 'stretch',
      gap: '10px',
      width: '100%',
      padding: '9px 10px',
      borderRadius: '3px',
      cursor: 'pointer',
      border: 'none',
      textAlign: 'left',
      font: `${active ? '500' : '400'} 13px/1.35 "IBM Plex Sans",sans-serif`,
      background: active ? 'rgba(255,255,255,.1)' : 'transparent',
      color: active ? '#fff' : 'rgba(255,255,255,.72)',
    },
    navHover,
  )

  return (
    <button type="button" onClick={onClick} aria-current={active ? 'page' : undefined} {...hover}>
      <span
        style={{
          display: 'block',
          width: '2px',
          alignSelf: 'stretch',
          borderRadius: '2px',
          background: active ? '#e0a83c' : 'transparent',
        }}
      />
      <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
        <span style={{ display: 'block' }}>{item.label}</span>
        <span
          style={{
            display: 'block',
            marginTop: '3px',
            font: '400 10.5px/1.35 "IBM Plex Sans",sans-serif',
            color: active ? 'rgba(255,255,255,.58)' : 'rgba(255,255,255,.4)',
          }}
        >
          {item.sub}
        </span>
      </span>
      <span
        style={{
          alignSelf: 'center',
          font: '400 10.5px/1.3 "IBM Plex Mono",monospace',
          color: active ? 'rgba(255,255,255,.7)' : 'rgba(255,255,255,.42)',
          whiteSpace: 'nowrap',
        }}
      >
        {item.badge}
      </span>
    </button>
  )
}

export function Sidebar({ screen, onNavigate, leadCount, breachCount, regionCount }: SidebarProps) {
  const nav: NavDef[] = [
    { id: 'overview', label: 'Overview', sub: 'Today at a glance', badge: breachCount ? `${breachCount} late` : '' },
    { id: 'leads', label: 'Leads', sub: 'Everyone the assistant captured', badge: String(leadCount) },
    { id: 'detail', label: 'Lead detail', sub: 'One record, end to end', badge: '' },
    { id: 'emails', label: 'Handoff emails', sub: 'What was sent, and to whom', badge: String(leadCount) },
    { id: 'team', label: 'Team & territories', sub: 'Who covers which states', badge: String(regionCount) },
  ]

  return (
    <aside
      style={{
        position: 'sticky',
        top: 0,
        flex: '0 0 244px',
        width: '244px',
        height: '100vh',
        background: '#0b2545',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        padding: '26px 0 18px',
      }}
    >
      <div style={{ padding: '0 22px 22px' }}>
        <div style={{ font: "600 17px/1.15 'IBM Plex Serif',Georgia,serif", letterSpacing: '-0.01em' }}>
          Guidance
        </div>
        <div
          style={{
            font: "400 11px/1.4 'IBM Plex Sans',sans-serif",
            letterSpacing: '.16em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,.52)',
            marginTop: '5px',
          }}
        >
          Home Services
        </div>
        <div style={{ height: '1px', background: 'rgba(255,255,255,.14)', margin: '16px 0 14px' }} />
        <div style={{ font: "500 12px/1.3 'IBM Plex Sans',sans-serif", color: 'rgba(255,255,255,.72)' }}>
          Operations console
        </div>
      </div>

      <nav
        aria-label="Screens"
        style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '0 12px' }}
      >
        {nav.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            active={screen === item.id}
            onClick={() => onNavigate(item.id)}
          />
        ))}
      </nav>

      <div style={{ marginTop: 'auto', padding: '0 22px' }}>
        <div style={{ border: '1px solid rgba(255,255,255,.16)', borderRadius: '4px', padding: '10px 11px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#e0a83c' }} />
            <span
              style={{
                font: "600 10.5px/1 'IBM Plex Sans',sans-serif",
                letterSpacing: '.1em',
                textTransform: 'uppercase',
                color: '#e5c489',
              }}
            >
              Demo data
            </span>
          </div>
          <p
            style={{
              margin: '7px 0 0',
              font: "400 11px/1.5 'IBM Plex Sans',sans-serif",
              color: 'rgba(255,255,255,.6)',
            }}
          >
            {leadCount} sample records. Not connected to production. Figures are illustrative only.
          </p>
        </div>
      </div>
    </aside>
  )
}
