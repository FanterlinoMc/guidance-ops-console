import type { CSSProperties } from 'react'
import { DESK, AGENT_DESK, GRID, LEADS, REGIONS } from '../data/leads'
import {
  coveredStates,
  leadsForRegion,
  regionOf,
  sla,
  triageLeads,
  uncoveredStates,
} from '../lib/routing'
import { C, HATCH, card, h2Serif, microLabel, pill } from '../lib/styles'
import { SegmentedControl } from '../components/SegmentedControl'
import type { MapStyle, Region } from '../types'

interface TeamProps {
  mapStyle: MapStyle
  onMapStyle: (m: MapStyle) => void
}

interface Tile {
  key: string
  ab: string
  title: string
  style: CSSProperties
}

/** One tile per state, positioned on an 11-column geographic grid. */
function buildTiles(outline: boolean): Tile[] {
  const tiles: Tile[] = []
  GRID.forEach((row, ri) => {
    row.split(' ').forEach((ab, ci) => {
      const place: CSSProperties = { gridColumn: String(ci + 1), gridRow: String(ri + 1) }
      if (ab === '.') {
        tiles.push({ key: `gap-${ri}-${ci}`, ab: '', title: '', style: place })
        return
      }
      const base: CSSProperties = {
        ...place,
        aspectRatio: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '3px',
        font: '500 11px/1 "IBM Plex Mono",monospace',
      }
      const reg = regionOf(ab)
      if (reg) {
        tiles.push({
          key: ab,
          ab,
          title: `${ab} — Region ${reg.id}, ${reg.owner}`,
          style: {
            ...base,
            ...(outline
              ? { background: '#fff', border: `1.5px solid ${reg.color}`, color: reg.color }
              : { background: reg.color, border: `1px solid ${reg.color}`, color: '#fff' }),
          },
        })
      } else {
        tiles.push({
          key: ab,
          ab,
          title: `${ab} — no Concierge coverage, manual triage`,
          style: { ...base, background: HATCH, border: '1px dashed #b9b4a8', color: '#7a7367' },
        })
      }
    })
  })
  return tiles
}

function RegionCard({ region }: { region: Region }) {
  const mine = leadsForRegion(region.id)
  const open = mine.filter((x) => x.fc == null).length
  const breach = mine.filter((x) => sla(x).key === 'breach').length

  return (
    <div
      style={{
        ...card,
        padding: '18px 20px 20px',
        borderLeft: `3px solid ${region.color}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '14px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <span
              style={pill('plain', {
                color: region.color,
                border: `1px solid ${region.color}`,
                padding: '2px 8px',
              })}
            >
              Region {region.id}
            </span>
            <span style={{ font: '500 14.5px/1.35 "IBM Plex Sans",sans-serif', color: C.navy }}>
              {region.owner}
            </span>
          </div>
          <div
            style={{
              font: '400 11.5px/1.5 "IBM Plex Mono",monospace',
              color: C.muted,
              marginTop: '6px',
              wordBreak: 'break-all',
            }}
          >
            {region.email}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ font: '500 20px/1 "IBM Plex Serif",Georgia,serif', color: C.navy }}>
            {mine.length}
          </div>
          <div style={{ ...microLabel, marginTop: '5px' }}>Leads</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '14px' }}>
        {region.states.map((ab) => (
          <span
            key={ab}
            style={{
              padding: '3px 7px',
              borderRadius: '3px',
              font: '400 11.5px/1.3 "IBM Plex Mono",monospace',
              background: '#f5f4ef',
              border: '1px solid #e8e5dd',
              color: C.body,
            }}
          >
            {ab}
          </span>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          marginTop: '16px',
          paddingTop: '13px',
          borderTop: `1px solid ${C.hair}`,
        }}
      >
        <div>
          <div style={microLabel}>Awaiting contact</div>
          <div
            style={{
              font: '500 15px/1.3 "IBM Plex Sans",sans-serif',
              marginTop: '4px',
              color: open ? '#2f5480' : C.faint,
            }}
          >
            {open}
          </div>
        </div>
        <div>
          <div style={microLabel}>Replies overdue</div>
          <div
            style={{
              font: '500 15px/1.3 "IBM Plex Sans",sans-serif',
              marginTop: '4px',
              color: breach ? '#8f1d16' : C.faint,
            }}
          >
            {breach}
          </div>
        </div>
        <div>
          <div style={microLabel}>States</div>
          <div
            style={{ font: '500 15px/1.3 "IBM Plex Sans",sans-serif', color: C.body, marginTop: '4px' }}
          >
            {region.states.length}
          </div>
        </div>
      </div>
    </div>
  )
}

function DeskCard({
  title,
  email,
  count,
  countLabel,
  note,
}: {
  title: string
  email: string
  count: number
  countLabel: string
  note: string
}) {
  return (
    <div style={{ ...card, padding: '18px 20px 20px', borderLeft: '3px solid #b9b4a8' }}>
      <div
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px' }}
      >
        <div>
          <div style={{ font: '500 14.5px/1.35 "IBM Plex Sans",sans-serif', color: C.navy }}>{title}</div>
          <div
            style={{
              font: '400 11.5px/1.5 "IBM Plex Mono",monospace',
              color: C.muted,
              marginTop: '6px',
              wordBreak: 'break-all',
            }}
          >
            {email}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ font: '500 20px/1 "IBM Plex Serif",Georgia,serif', color: C.navy }}>{count}</div>
          <div style={{ ...microLabel, marginTop: '5px' }}>{countLabel}</div>
        </div>
      </div>
      <p style={{ margin: '13px 0 0', font: '400 12px/1.6 "IBM Plex Sans",sans-serif', color: C.body }}>
        {note}
      </p>
    </div>
  )
}

export function Team({ mapStyle, onMapStyle }: TeamProps) {
  const outline = mapStyle === 'Outline'
  const tiles = buildTiles(outline)
  const uncovered = uncoveredStates()
  const swatchBase: CSSProperties = { width: '11px', height: '11px', borderRadius: '2px' }

  // DC is carried in a region's state list but is not a state, so it is named
  // separately in the map's description.
  const coveredCount = coveredStates().length
  const mapAria =
    `Grid map of US states coloured by Concierge region. Regions A to E cover ` +
    `${coveredCount - 1} states and DC; ${uncovered.length} states have no coverage.`

  return (
    <section aria-label="Team and territories" style={{ padding: '22px 34px 46px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-start' }}>
        {/* Territory grid. */}
        <div style={{ ...card, flex: '1.35 1 520px', minWidth: 0, padding: '20px 22px 24px' }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
            }}
          >
            <h2 style={{ ...h2Serif, marginBottom: '3px' }}>Concierge territory grid</h2>
            <SegmentedControl
              label="Map fill"
              value={mapStyle}
              options={['Filled', 'Outline'] as const}
              onChange={onMapStyle}
            />
          </div>
          <p
            style={{
              margin: '0 0 20px',
              font: '400 11.5px/1.55 "IBM Plex Sans",sans-serif',
              color: C.faint,
              maxWidth: '62ch',
            }}
          >
            One tile per state, laid out geographically. Colour marks the owning Concierge region;
            unfilled tiles have no coverage and route to the concierge desk for manual triage.
          </p>

          <div
            role="img"
            aria-label={mapAria}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(11,minmax(0,1fr))',
              gap: '5px',
              maxWidth: '660px',
            }}
          >
            {tiles.map((t) => (
              <div key={t.key} title={t.title || undefined} style={t.style}>
                {t.ab}
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '14px',
              marginTop: '22px',
              paddingTop: '18px',
              borderTop: `1px solid ${C.hair}`,
            }}
          >
            {REGIONS.map((rg) => (
              <div key={rg.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={
                    outline
                      ? { ...swatchBase, background: '#fff', border: `1.5px solid ${rg.color}` }
                      : { ...swatchBase, background: rg.color }
                  }
                />
                <span style={{ font: '400 11.5px/1.3 "IBM Plex Sans",sans-serif', color: C.body }}>
                  Region {rg.id} — {rg.owner.split(' ')[0]}
                </span>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ ...swatchBase, background: HATCH, border: '1px dashed #b9b4a8' }} />
              <span style={{ font: '400 11.5px/1.3 "IBM Plex Sans",sans-serif', color: C.body }}>
                No coverage — manual triage
              </span>
            </div>
          </div>

          <div
            style={{
              marginTop: '20px',
              padding: '13px 14px',
              background: C.panel,
              border: '1px solid #eae7e0',
              borderRadius: '4px',
            }}
          >
            <div
              style={{
                font: '600 10px/1.3 "IBM Plex Sans",sans-serif',
                letterSpacing: '.1em',
                textTransform: 'uppercase',
                color: C.muted,
              }}
            >
              Uncovered states — {uncovered.length} states
            </div>
            <p
              style={{
                margin: '7px 0 0',
                font: '400 12px/1.6 "IBM Plex Mono",monospace',
                color: C.body,
              }}
            >
              {uncovered.join('  ')}
            </p>
            <p
              style={{
                margin: '8px 0 0',
                font: '400 11.5px/1.6 "IBM Plex Sans",sans-serif',
                color: C.muted,
              }}
            >
              Leads from these states are never reassigned to the nearest region. They go to the concierge
              desk for manual triage.
            </p>
          </div>
        </div>

        {/* Owners and desks. */}
        <div
          style={{
            flex: '1 1 380px',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {REGIONS.map((rg) => (
            <RegionCard key={rg.id} region={rg} />
          ))}

          <DeskCard
            title="Concierge desk — manual triage"
            email={DESK}
            count={triageLeads().length}
            countLabel="Leads"
            note="Catches uncovered states and captures where no state was given. Assigned by hand."
          />

          <DeskCard
            title="Agent network desk"
            email={AGENT_DESK}
            count={LEADS.filter((x) => x.tk === 'agent').length}
            countLabel="Signups"
            note="Real estate agents applying to the referral network. Never region-routed and never handled as financing leads."
          />

          {/* The separation the console is built around. */}
          <div style={{ background: C.navy, color: '#fff', borderRadius: '5px', padding: '18px 20px 20px' }}>
            <div
              style={{
                font: '600 10px/1.3 "IBM Plex Sans",sans-serif',
                letterSpacing: '.1em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,.6)',
              }}
            >
              Two teams, never merged
            </div>
            <p
              style={{
                margin: '10px 0 0',
                font: '400 12.5px/1.7 "IBM Plex Sans",sans-serif',
                color: 'rgba(255,255,255,.86)',
              }}
            >
              <strong style={{ fontWeight: 600, color: '#fff' }}>Account Executives</strong> own financing
              — rates, eligibility, applications. They are staffed nationally and are not region-routed.
            </p>
            <p
              style={{
                margin: '10px 0 0',
                font: '400 12.5px/1.7 "IBM Plex Sans",sans-serif',
                color: 'rgba(255,255,255,.86)',
              }}
            >
              <strong style={{ fontWeight: 600, color: '#fff' }}>GHS Concierge</strong> owns agent matching
              for buying and selling. The five regions above are Concierge territory only.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
