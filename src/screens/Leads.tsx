import type { CSSProperties } from 'react'
import { LEADS, STAGES } from '../data/leads'
import { ownerLabel, ownerTeam, route, sla, stageIdx, stageLabel } from '../lib/routing'
import { span } from '../lib/time'
import {
  C,
  card,
  cellBase,
  cellMonoBase,
  chip,
  dot,
  headStyle,
  pill,
  rowHover,
} from '../lib/styles'
import { useHover } from '../lib/useHover'
import type { Density, Filters, Lead, RegionFilter, Track } from '../types'
import { GhostButton } from '../components/GhostButton'
import { SegmentedControl } from '../components/SegmentedControl'

interface LeadsProps {
  filters: Filters
  onFilters: (f: Filters) => void
  density: Density
  onDensity: (d: Density) => void
  onOpenLead: (id: string) => void
}

const REGION_CHIPS: [RegionFilter, string][] = [
  ['all', 'Anyone'],
  ['A', 'Region A'],
  ['B', 'Region B'],
  ['C', 'Region C'],
  ['D', 'Region D'],
  ['E', 'Region E'],
  ['desk', 'Concierge desk (no region)'],
  ['agent', 'Agent network desk'],
]

const TRACK_CHIPS: [Filters['track'], string][] = [
  ['all', 'Either'],
  ['homebuyer', 'To buy or sell a home'],
  ['agent', 'To join as an agent'],
]

const LEAD_COLS = [
  'Lead',
  'Wants',
  'State',
  'Region',
  'Assigned owner',
  'Stage',
  'Waiting',
  'First reply',
]

/** Plain-language decoder for the pills used in the table. */
const LABEL_KEY: { dotColor: string; term: string; gloss: string }[] = [
  { dotColor: '#4573ab', term: 'Due in 22m', gloss: '— waiting on a first reply, still inside the target.' },
  { dotColor: '#b3291f', term: 'Breached', gloss: '— past the target with no reply. Act now.' },
  { dotColor: '#2b7a5c', term: 'Met', gloss: '— someone replied inside the target. Settled.' },
  {
    dotColor: '#c08a17',
    term: 'Concierge desk',
    gloss: '— no region owner, so a person must pick it up by hand.',
  },
]

export const EMPTY_FILTERS: Filters = { region: 'all', track: 'all', stage: 'all' }

/** Filtering runs against derived routing, so region chips follow the live rules. */
export function filterLeads(filters: Filters): Lead[] {
  return LEADS.filter((l) => {
    const r = route(l)
    if (filters.track !== 'all' && l.tk !== filters.track) return false
    if (filters.stage !== 'all' && l.st !== filters.stage) return false
    if (filters.region !== 'all') {
      if (filters.region === 'desk') {
        if (r.region || r.reason === 'agent-signup') return false
      } else if (filters.region === 'agent') {
        if (r.reason !== 'agent-signup') return false
      } else if (r.region !== filters.region) {
        return false
      }
    }
    return true
  })
}

function Row({
  lead,
  cell,
  cellMono,
  onOpen,
}: {
  lead: Lead
  cell: CSSProperties
  cellMono: CSSProperties
  onOpen: () => void
}) {
  const r = route(lead)
  const s = sla(lead)
  const si = stageIdx(lead.st)
  const hover = useHover({ cursor: 'pointer', borderTop: `1px solid ${C.hair}` }, rowHover)

  return (
    <tr
      tabIndex={0}
      role="button"
      aria-label={`Open lead ${lead.n}, ${lead.id}`}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen()
        }
      }}
      {...hover}
    >
      <td style={cell}>
        <div style={{ font: '500 13px/1.4 "IBM Plex Sans",sans-serif', color: C.navy }}>{lead.n}</div>
        <div
          style={{
            font: '400 11px/1.4 "IBM Plex Mono",monospace',
            color: C.faint,
            marginTop: '3px',
          }}
        >
          {lead.id}
        </div>
      </td>
      <td style={cell}>
        <span
          style={pill(lead.tk === 'agent' ? 'info' : 'plain', {
            padding: '2px 7px',
            font: '400 11.5px/1.4 "IBM Plex Sans",sans-serif',
          })}
        >
          {lead.tk === 'agent' ? 'To join as agent' : 'To buy or sell'}
        </span>
      </td>
      <td style={cellMono}>{lead.s || '—'}</td>
      <td style={cell}>
        <span
          style={pill(r.region ? 'plain' : 'attention', {
            padding: '2px 7px',
            font: '500 11.5px/1.4 "IBM Plex Sans",sans-serif',
          })}
        >
          {ownerLabel(r)}
        </span>
      </td>
      <td style={cell}>
        <div style={{ font: '400 12.5px/1.4 "IBM Plex Sans",sans-serif', color: C.body }}>
          {r.ownerName}
        </div>
        <div
          style={{
            font: '400 11px/1.4 "IBM Plex Sans",sans-serif',
            color: C.faint,
            marginTop: '2px',
          }}
        >
          {ownerTeam(r)}
        </div>
      </td>
      <td style={cell}>
        <span
          style={pill(si >= 5 ? 'settled' : 'info', {
            padding: '2px 7px',
            font: '400 11.5px/1.4 "IBM Plex Sans",sans-serif',
          })}
        >
          {stageLabel(lead.st)}
        </span>
      </td>
      <td style={cellMono}>{span(lead.t)}</td>
      <td style={cell}>
        <span
          style={pill(s.tone, { padding: '2px 7px', font: '500 11.5px/1.4 "IBM Plex Sans",sans-serif' })}
        >
          <span style={dot(s.tone)} />
          {s.label}
        </span>
      </td>
    </tr>
  )
}

export function Leads({ filters, onFilters, density, onDensity, onOpenLead }: LeadsProps) {
  const dense = density === 'Compact'
  const cell = dense ? { ...cellBase, padding: '8px 12px' } : cellBase
  const cellMono = dense ? { ...cellMonoBase, padding: '8px 12px' } : cellMonoBase

  const shown = filterLeads(filters)
  const clear = () => onFilters(EMPTY_FILTERS)

  const groupLabel: CSSProperties = {
    font: '500 10px/1.3 "IBM Plex Sans",sans-serif',
    letterSpacing: '.11em',
    textTransform: 'uppercase',
    color: C.faint,
    marginBottom: '8px',
  }

  return (
    <section aria-label="Leads" style={{ padding: '22px 34px 46px' }}>
      {/* Filters, phrased as questions. */}
      <div style={{ ...card, padding: '16px 18px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '22px', alignItems: 'flex-start' }}>
          <div>
            <div style={groupLabel}>Who it went to</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {REGION_CHIPS.map(([v, label]) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={filters.region === v}
                  onClick={() => onFilters({ ...filters, region: v })}
                  style={chip(filters.region === v)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={groupLabel}>What they want</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {TRACK_CHIPS.map(([v, label]) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={filters.track === v}
                  onClick={() => onFilters({ ...filters, track: v as 'all' | Track })}
                  style={chip(filters.track === v)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="stage-filter" style={{ display: 'block', ...groupLabel }}>
              How far along
            </label>
            <select
              id="stage-filter"
              value={filters.stage}
              onChange={(e) => onFilters({ ...filters, stage: e.target.value as Filters['stage'] })}
              style={{
                appearance: 'none',
                background: C.surface,
                border: '1px solid #dcd9d2',
                borderRadius: '3px',
                padding: '7px 30px 7px 10px',
                font: '400 12.5px/1.3 "IBM Plex Sans",sans-serif',
                color: C.ink,
                minWidth: '190px',
                cursor: 'pointer',
              }}
            >
              <option value="all">All stages</option>
              {STAGES.map(([v, label]) => (
                <option key={v} value={v}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
            marginTop: '16px',
            paddingTop: '14px',
            borderTop: `1px solid ${C.hair}`,
          }}
        >
          <span style={{ font: '400 12px/1.4 "IBM Plex Sans",sans-serif', color: C.muted }}>
            {shown.length} of {LEADS.length} leads shown
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <SegmentedControl
              label="Density"
              value={density}
              options={['Comfortable', 'Compact'] as const}
              onChange={onDensity}
            />
            <GhostButton onClick={clear}>Clear filters</GhostButton>
          </div>
        </div>
      </div>

      {/* Key decoding the pills below. */}
      <div
        style={{
          marginTop: '14px',
          background: C.sunken,
          border: `1px solid ${C.line}`,
          borderRadius: '5px',
          padding: '14px 18px 15px',
        }}
      >
        <div style={{ ...groupLabel, marginBottom: '11px' }}>What the labels mean</div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))',
            gap: '11px 22px',
          }}
        >
          {LABEL_KEY.map((k) => (
            <div key={k.term} style={{ display: 'flex', gap: '9px', alignItems: 'flex-start' }}>
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: k.dotColor,
                  marginTop: '6px',
                  flex: '0 0 6px',
                }}
              />
              <p style={{ margin: 0, font: '400 12px/1.55 "IBM Plex Sans",sans-serif', color: C.body }}>
                <strong style={{ fontWeight: 500, color: C.ink }}>{k.term}</strong> {k.gloss}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Register. */}
      <div style={{ ...card, marginTop: '14px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '1020px' }}>
            <caption
              style={{
                textAlign: 'left',
                padding: '16px 18px 0',
                font: '400 11.5px/1.4 "IBM Plex Sans",sans-serif',
                color: C.faint,
              }}
            >
              Sample lead register — click a row for the full record.
            </caption>
            <thead>
              <tr>
                {LEAD_COLS.map((label) => (
                  <th key={label} scope="col" style={headStyle}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map((l) => (
                <Row
                  key={l.id}
                  lead={l}
                  cell={cell}
                  cellMono={cellMono}
                  onOpen={() => onOpenLead(l.id)}
                />
              ))}
            </tbody>
          </table>
        </div>

        {shown.length === 0 ? <EmptyState onClear={clear} /> : null}
      </div>
    </section>
  )
}

function EmptyState({ onClear }: { onClear: () => void }) {
  const hover = useHover(
    {
      marginTop: '18px',
      background: C.navy,
      border: `1px solid ${C.navy}`,
      borderRadius: '3px',
      padding: '8px 15px',
      font: '500 12px/1.3 "IBM Plex Sans",sans-serif',
      color: '#fff',
      cursor: 'pointer',
      whiteSpace: 'nowrap' as const,
    },
    { background: '#16375e' },
  )
  return (
    <div style={{ padding: '56px 24px 60px', textAlign: 'center', borderTop: `1px solid ${C.hair}` }}>
      <div
        style={{
          width: '34px',
          height: '34px',
          margin: '0 auto',
          border: '1px dashed #cfccc4',
          borderRadius: '3px',
        }}
      />
      <h3
        style={{
          margin: '16px 0 0',
          font: '500 15px/1.3 "IBM Plex Serif",Georgia,serif',
          color: C.navy,
        }}
      >
        No leads match these filters
      </h3>
      <p
        style={{
          margin: '7px auto 0',
          maxWidth: '44ch',
          font: '400 12.5px/1.6 "IBM Plex Sans",sans-serif',
          color: C.muted,
        }}
      >
        None of the {LEADS.length} demo leads satisfies every filter at once. Loosen one — region and
        track together are the usual culprit, since agent signups are never region-routed.
      </p>
      <button type="button" onClick={onClear} {...hover}>
        Clear all filters
      </button>
    </div>
  )
}
