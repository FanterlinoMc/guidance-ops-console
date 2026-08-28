import type { CSSProperties } from 'react'
import { LEADS } from '../data/leads'
import { breachedLeads, emailFor, route, sla, slaMin, triageLeads } from '../lib/routing'
import { ago, span } from '../lib/time'
import { C, card, dot, h2Serif, pill } from '../lib/styles'
import type { ToneName } from '../types'
import { GhostButton } from '../components/GhostButton'

interface OverviewProps {
  onOpenLead: (id: string) => void
}

/* ---------- KPI ---------- */

interface Kpi {
  label: string
  value: number
  unit: string
  note: string
  urgent?: boolean
}

function KpiCard({ k }: { k: Kpi }) {
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${k.urgent ? '#eed3ce' : C.line}`,
        borderRadius: '5px',
        padding: '18px 20px 20px',
        boxShadow: k.urgent ? 'inset 3px 0 0 #b3291f' : 'none',
      }}
    >
      <div
        style={{
          font: '500 10.5px/1.3 "IBM Plex Sans",sans-serif',
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          color: C.muted,
        }}
      >
        {k.label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '9px', marginTop: '14px' }}>
        <span
          style={{
            font: '500 32px/1 "IBM Plex Serif",Georgia,serif',
            color: k.urgent ? '#8f1d16' : C.navy,
            letterSpacing: '-0.02em',
          }}
        >
          {k.value}
        </span>
        <span style={{ font: '400 12px/1.3 "IBM Plex Sans",sans-serif', color: C.faint }}>{k.unit}</span>
      </div>
      <div
        style={{
          marginTop: '12px',
          font: '400 11.5px/1.5 "IBM Plex Sans",sans-serif',
          color: k.urgent ? '#8f1d16' : C.faint,
        }}
      >
        {k.note}
      </div>
    </div>
  )
}

/* ---------- explainer steps ---------- */

const STEPS: { lead: string; rest: string }[] = [
  {
    lead: 'The assistant captures the lead.',
    rest: 'It answers financing questions on the website and asks for name, email, phone, location and timeline.',
  },
  {
    lead: 'Routing reads the US state',
    rest: 'and picks one of five regional GHS Concierge owners. Agents applying to the referral network go to the agent desk instead, never to a region.',
  },
  {
    lead: 'A handoff email goes to that owner,',
    rest: 'copying the concierge team. If it is still queued, nobody has been told yet.',
  },
  {
    lead: 'The owner replies within the target:',
    rest: 'one hour for homebuyers, three for agents. Past that, the lead shows as late.',
  },
]

const stepNumber: CSSProperties = {
  flex: '0 0 22px',
  height: '22px',
  borderRadius: '50%',
  background: '#f1efe9',
  border: '1px solid #e2dfd6',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  font: '500 11px/1 "IBM Plex Mono",monospace',
  color: C.navy,
}

/* ---------- activity feed ---------- */

interface FeedEvent {
  /** Minutes ago. */
  t: number
  tone: ToneName
  tag: string
  text: string
  id: string
}

function buildFeed(): FeedEvent[] {
  const ev: FeedEvent[] = []
  LEADS.forEach((l) => {
    const r = route(l)
    const em = emailFor(l)
    ev.push({
      t: l.t,
      tone: 'info',
      tag: 'Captured',
      text: `${l.n} captured by the assistant${l.s ? ` · ${l.c}, ${l.s}` : ' · no state given'}`,
      id: l.id,
    })
    if (em.status === 'sent') {
      ev.push({
        t: em.sentMin!,
        tone: 'settled',
        tag: 'Email sent',
        text: `Handoff for ${l.n} sent to ${em.to}`,
        id: l.id,
      })
    }
    if (em.status === 'queued') {
      ev.push({
        t: em.queuedMin,
        tone: 'attention',
        tag: 'Email queued',
        text: `Handoff for ${l.n} queued for ${em.to}`,
        id: l.id,
      })
    }
    if (em.status === 'failed') {
      ev.push({
        t: em.sentMin!,
        tone: 'urgent',
        tag: 'Email failed',
        text: `Handoff for ${l.n} failed — mailbox unavailable`,
        id: l.id,
      })
    }
    if (l.fc != null) {
      ev.push({
        t: l.t - l.fc,
        tone: 'settled',
        tag: 'First contact',
        text: `${r.ownerName} reached ${l.n} in ${span(l.fc)}`,
        id: l.id,
      })
    }
    if (sla(l).key === 'breach') {
      ev.push({
        t: l.t - slaMin(l),
        tone: 'urgent',
        tag: 'Reply overdue',
        text: `${l.n} passed the ${span(slaMin(l))} first-reply target with no answer`,
        id: l.id,
      })
    }
  })
  return ev.sort((a, b) => a.t - b.t).slice(0, 10)
}

/* ---------- screen ---------- */

export function Overview({ onOpenLead }: OverviewProps) {
  const leads = LEADS
  const today = leads.filter((l) => l.t < 1440)
  const awaiting = leads.filter((l) => l.fc == null)
  const breaches = breachedLeads().length
  const triage = triageLeads()
  const feed = buildFeed()

  const kpis: Kpi[] = [
    {
      label: 'New leads · last 24 hours',
      value: today.length,
      unit: `of ${leads.length}`,
      note: 'The rest were captured earlier and are already being worked.',
    },
    {
      label: 'Waiting for a first reply',
      value: awaiting.length,
      unit: 'leads',
      note: 'Routed to an owner, but nobody has responded yet.',
    },
    {
      label: 'Late — past reply target',
      value: breaches,
      unit: breaches === 1 ? 'lead' : 'leads',
      note: 'Over 1 hour for a homebuyer, 3 hours for an agent. Needs action now.',
      urgent: true,
    },
    {
      label: 'No owner assigned',
      value: triage.length,
      unit: 'leads',
      note: 'The state is not covered, or no state was given. A person must assign these.',
    },
  ]

  const trackCount = (k: 'homebuyer' | 'agent') => leads.filter((l) => l.tk === k).length
  const tracks = [
    {
      name: 'Homebuyers → GHS Concierge',
      countLabel: `${trackCount('homebuyer')} of ${leads.length}`,
      note: 'People buying or selling a home. Routed by state to one of five regional Concierge owners, who introduces them to a vetted real estate agent. Financing questions go to an Account Executive.',
    },
    {
      name: 'Agent signups → Agent network desk',
      countLabel: `${trackCount('agent')} of ${leads.length}`,
      note: 'Real estate agents asking to join the referral network. Sent to reasignup@ and never treated as financing leads.',
    },
  ]

  return (
    <section aria-label="Overview" style={{ padding: '26px 34px 46px' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(212px,1fr))',
          gap: '14px',
        }}
      >
        {kpis.map((k) => (
          <KpiCard key={k.label} k={k} />
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          marginTop: '16px',
          alignItems: 'flex-start',
        }}
      >
        {/* Orientation for first-time viewers. */}
        <div style={{ ...card, flex: '1 1 340px', minWidth: 0, padding: '20px 22px 22px' }}>
          <h2 style={{ ...h2Serif, marginBottom: '2px' }}>How a lead reaches a person</h2>
          <p
            style={{
              margin: '0 0 18px',
              font: '400 11.5px/1.5 "IBM Plex Sans",sans-serif',
              color: C.faint,
            }}
          >
            Every record in this console follows these four steps.
          </p>
          <ol
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            {STEPS.map((s, i) => (
              <li key={s.lead} style={{ display: 'flex', gap: '12px' }}>
                <span style={stepNumber}>{i + 1}</span>
                <p
                  style={{
                    margin: 0,
                    font: '400 12.5px/1.6 "IBM Plex Sans",sans-serif',
                    color: C.body,
                  }}
                >
                  <strong style={{ fontWeight: 500, color: C.ink }}>{s.lead}</strong> {s.rest}
                </p>
              </li>
            ))}
          </ol>

          <div style={{ height: '1px', background: '#efede8', margin: '22px 0 18px' }} />

          <h2 style={{ ...h2Serif, marginBottom: '4px' }}>Who handles what</h2>
          <p
            style={{
              margin: '0 0 14px',
              font: '400 11.5px/1.5 "IBM Plex Sans",sans-serif',
              color: C.faint,
            }}
          >
            Two separate teams. A lead belongs to one track, never both.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
            {tracks.map((t) => (
              <div key={t.name}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    gap: '10px',
                  }}
                >
                  <span style={{ font: '500 13px/1.4 "IBM Plex Sans",sans-serif', color: C.ink }}>
                    {t.name}
                  </span>
                  <span style={{ font: '500 12.5px/1.4 "IBM Plex Mono",monospace', color: C.body }}>
                    {t.countLabel}
                  </span>
                </div>
                <p
                  style={{
                    margin: '5px 0 0',
                    font: '400 11.5px/1.5 "IBM Plex Sans",sans-serif',
                    color: C.faint,
                  }}
                >
                  {t.note}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Activity feed. */}
        <div style={{ ...card, flex: '2 1 480px', minWidth: 0, padding: '20px 22px 8px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <h2 style={h2Serif}>Activity</h2>
            <span style={{ font: '400 11px/1.3 "IBM Plex Sans",sans-serif', color: C.faint }}>
              Last 10 events
            </span>
          </div>
          <ul style={{ listStyle: 'none', margin: '16px 0 0', padding: 0 }}>
            {feed.map((f, i) => (
              <li
                key={`${f.id}-${f.tag}-${i}`}
                style={{
                  display: 'flex',
                  gap: '13px',
                  padding: '11px 0',
                  borderTop: `1px solid ${C.hair}`,
                }}
              >
                <span style={{ ...dot(f.tone), marginTop: '6px' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: '400 12.5px/1.5 "IBM Plex Sans",sans-serif', color: C.ink }}>
                    {f.text}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span
                      style={pill(f.tone, {
                        padding: '2px 7px',
                        font: '500 10.5px/1.4 "IBM Plex Sans",sans-serif',
                      })}
                    >
                      {f.tag}
                    </span>
                    <span style={{ font: '400 11px/1.3 "IBM Plex Mono",monospace', color: C.faint }}>
                      {ago(f.t)}
                    </span>
                  </div>
                </div>
                <GhostButton
                  onClick={() => onOpenLead(f.id)}
                  extra={{ alignSelf: 'center', padding: '4px 9px', font: '500 11px/1.3 "IBM Plex Sans",sans-serif' }}
                >
                  Open
                </GhostButton>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
