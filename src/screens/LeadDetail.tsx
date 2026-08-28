import type { CSSProperties } from 'react'
import { CHAN, LEADS, STAGES, TRANSCRIPTS } from '../data/leads'
import {
  REASON_CODE,
  emailFor,
  reasonText,
  route,
  sla,
  slaMin,
  stageIdx,
  stageLabel,
  statusMeta,
} from '../lib/routing'
import { ago, full, hhmm, short, span } from '../lib/time'
import {
  C,
  card,
  dot,
  eyebrowBold,
  fieldMissing,
  fieldMono,
  fieldValue,
  h3Serif,
  pill,
  tone,
} from '../lib/styles'
import type { Lead, ToneName } from '../types'
import { GhostButton } from '../components/GhostButton'

interface LeadDetailProps {
  leadId: string
  onBack: () => void
  onOpenEmailLog: (leadId: string) => void
}

/* ---------- the one banner that explains this record's state ---------- */

function alertFor(l: Lead): { tone: ToneName; title: string; body: string } {
  const r = route(l)
  const s = sla(l)
  const em = emailFor(l)

  if (s.key === 'breach') {
    return {
      tone: 'urgent',
      title: 'First reply overdue',
      body:
        `Captured ${ago(l.t)} and still not contacted. The first-contact target for ` +
        `${l.tk === 'agent' ? 'agent signups is 3 hours' : 'homebuyers is 1 hour'}. ` +
        (em.status === 'queued'
          ? 'The handoff email is still queued, so the owner may not know this lead exists.'
          : `The handoff email was delivered to ${r.ownerName}.`),
    }
  }
  if (r.reason === 'state-uncovered') {
    return {
      tone: 'attention',
      title: 'Not routed — state has no coverage',
      body: `${l.s} is not part of any Concierge region, so no owner was assigned. This sits with the concierge desk until someone picks it up by hand. Do not reassign it to the nearest region.`,
    }
  }
  if (r.reason === 'no-state') {
    return {
      tone: 'attention',
      title: 'Not routed — no state captured',
      body: 'The conversation ended without a US state, so routing could not run at all. Unlike an uncovered state, there is nothing to triage against yet — someone needs to ask the customer where they are buying.',
    }
  }
  if (em.status === 'failed') {
    return {
      tone: 'urgent',
      title: 'Handoff email failed',
      body: `Delivery to ${em.to} failed and there is no automatic retry. The owner has not been notified.`,
    }
  }
  if (em.status === 'queued') {
    return {
      tone: 'attention',
      title: 'Handoff email queued',
      body: 'The email is composed and waiting in the outbox. Dispatch is manual today, so the owner has not been notified yet.',
    }
  }
  if (s.key === 'late') {
    return {
      tone: 'attention',
      title: 'First contact was late',
      body: `Contacted after ${span(l.fc!)}, past the ${span(slaMin(l))} target. The lead is now progressing normally.`,
    }
  }
  return {
    tone: 'settled',
    title: 'Routed and answered',
    body: `Handed to ${r.ownerName}${r.region ? ` (Region ${r.region})` : ''} and contacted in ${span(
      l.fc ?? 0,
    )}, inside the ${span(slaMin(l))} target.`,
  }
}

/** Plain-language restatement of the first-reply state, matching the table. */
function slaSentence(l: Lead): string {
  const s = sla(l)
  if (s.key === 'met') return `First reply met in ${span(l.fc!)}`
  if (s.key === 'late') return `First reply late — took ${span(l.fc!)}`
  if (s.key === 'breach') return `First reply overdue by ${span(l.t - slaMin(l))}`
  return `First reply due in ${span(slaMin(l) - l.t)}`
}

/* ---------- stage history ----------
   Demo timings: each stage is placed a fixed offset either side of capture,
   so the history reads plausibly without inventing stored timestamps. */

const STAGE_OFFSETS = (l: Lead): number[] => {
  const fc = l.fc ?? 0
  return [-9, -6, -3, 0, 8, fc, fc + 1440, fc + 4320, fc + 8640, fc + 12960]
}

const STAGE_ACTORS = (l: Lead): string[] => [
  '',
  '',
  '',
  '',
  l.ae || 'unassigned',
  route(l).ownerName,
  l.ae || 'Account Executive',
  l.ae || 'Account Executive',
  l.ae || 'Account Executive',
  l.ae || 'Account Executive',
]

const STAGE_TEAMS = [
  'Assistant',
  'Assistant',
  'Assistant',
  'Assistant',
  'Account Executive',
  'GHS Concierge',
  'Account Executive',
  'Account Executive',
  'Account Executive',
  'Account Executive',
]

/* ---------- screen ---------- */

export function LeadDetail({ leadId, onBack, onOpenEmailLog }: LeadDetailProps) {
  const l = LEADS.find((x) => x.id === leadId) ?? LEADS[0]
  const r = route(l)
  const s = sla(l)
  const si = stageIdx(l.st)
  const em = emailFor(l)
  const alert = alertFor(l)
  const at = tone(alert.tone)
  const sm = statusMeta(em.status)
  const transcript = TRANSCRIPTS[l.id]

  const offsets = STAGE_OFFSETS(l)
  const actors = STAGE_ACTORS(l)

  const fields: { label: string; value: string; style: CSSProperties }[] = [
    { label: 'Name', value: l.n, style: fieldValue },
    { label: 'Email', value: l.e, style: fieldMono },
    { label: 'Phone', value: l.p || 'Not captured', style: l.p ? fieldMono : fieldMissing },
    { label: 'City', value: l.c || 'Not captured', style: l.c ? fieldValue : fieldMissing },
    { label: 'State', value: l.s || 'Not captured', style: l.s ? fieldValue : fieldMissing },
    { label: l.tk === 'agent' ? 'Availability' : 'Timeline', value: l.tl, style: fieldValue },
    { label: 'Source', value: CHAN[l.ch], style: fieldValue },
    { label: 'Captured', value: `${full(l.t)} · ${ago(l.t)}`, style: fieldValue },
    { label: 'Session', value: `sess_${l.sid}`, style: fieldMono },
  ]

  const summary =
    (l.tk === 'agent'
      ? 'Real estate agent applying to the referral network'
      : `Homebuyer${l.s ? ` in ${l.c}, ${l.s}` : ' — location not captured'}`) +
    ` · captured ${ago(l.t)} · ${CHAN[l.ch]}`

  const statusNote =
    em.status === 'sent'
      ? `Delivered ${full(em.sentMin!)} · ${ago(em.sentMin!)}`
      : em.status === 'queued'
        ? `Composed ${full(em.queuedMin)} and still in the outbox. Dispatch is manual today.`
        : `Attempted ${full(em.sentMin!)} — delivery failed, no automatic retry.`

  return (
    <section aria-label="Lead detail" style={{ padding: '22px 34px 46px' }}>
      <button
        type="button"
        onClick={onBack}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          margin: '0 0 16px',
          font: '500 12px/1.3 "IBM Plex Sans",sans-serif',
          color: C.link,
          cursor: 'pointer',
        }}
      >
        ← All leads
      </button>

      {/* Identity + the single most important thing about this record. */}
      <div style={{ ...card, padding: '22px 24px' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '20px',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h2
                style={{
                  margin: 0,
                  font: '500 22px/1.2 "IBM Plex Serif",Georgia,serif',
                  color: C.navy,
                }}
              >
                {l.n}
              </h2>
              <span style={{ font: '400 12px/1.3 "IBM Plex Mono",monospace', color: C.faint }}>
                {l.id}
              </span>
            </div>
            <p
              style={{
                margin: '8px 0 0',
                font: '400 13px/1.5 "IBM Plex Sans",sans-serif',
                color: C.muted,
              }}
            >
              {summary}
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
            <span style={pill(l.tk === 'agent' ? 'info' : 'plain')}>
              {l.tk === 'agent' ? 'Agent signup' : 'Homebuyer'}
            </span>
            <span style={pill('plain')}>{CHAN[l.ch]}</span>
            <span style={pill(si >= 5 ? 'settled' : 'info')}>{stageLabel(l.st)}</span>
            <span style={pill(s.tone)}>
              <span style={dot(s.tone)} />
              {slaSentence(l)}
            </span>
          </div>
        </div>

        <div
          style={{
            marginTop: '18px',
            padding: '13px 15px',
            borderRadius: '4px',
            color: at.color,
            background: at.background,
            border: at.border,
          }}
        >
          <span
            style={{
              font: '600 11px/1.4 "IBM Plex Sans",sans-serif',
              letterSpacing: '.08em',
              textTransform: 'uppercase',
            }}
          >
            {alert.title}
          </span>
          <p style={{ margin: '6px 0 0', font: '400 12.5px/1.6 "IBM Plex Sans",sans-serif' }}>
            {alert.body}
          </p>
        </div>
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
        {/* Left column. */}
        <div
          style={{
            flex: '1 1 380px',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ ...card, padding: '20px 22px 22px' }}>
            <h3 style={{ ...h3Serif, marginBottom: '16px' }}>Captured fields</h3>
            <dl
              style={{
                margin: 0,
                display: 'grid',
                gridTemplateColumns: 'minmax(96px,auto) 1fr',
                gap: '11px 18px',
              }}
            >
              {fields.map((f) => (
                <div key={f.label} style={{ display: 'contents' }}>
                  <dt style={{ font: '400 11.5px/1.5 "IBM Plex Sans",sans-serif', color: C.faint }}>
                    {f.label}
                  </dt>
                  <dd style={f.style}>{f.value}</dd>
                </div>
              ))}
            </dl>
            <div
              style={{
                marginTop: '18px',
                padding: '11px 12px',
                background: C.panel,
                border: '1px solid #eae7e0',
                borderRadius: '4px',
              }}
            >
              <div style={eyebrowBold}>Data policy</div>
              <p
                style={{
                  margin: '6px 0 0',
                  font: '400 11.5px/1.6 "IBM Plex Sans",sans-serif',
                  color: C.body,
                }}
              >
                No financial identifiers are collected or stored. The assistant declines Social Security
                numbers, bank account numbers and card details by design, and none appear in this record.
              </p>
            </div>
          </div>

          {/* Concierge ownership, kept structurally apart from the AE assignment. */}
          <div style={{ ...card, padding: '20px 22px 22px' }}>
            <h3 style={{ ...h3Serif, marginBottom: '4px' }}>Routing decision</h3>
            <p
              style={{
                margin: '0 0 16px',
                font: '400 11.5px/1.5 "IBM Plex Sans",sans-serif',
                color: C.faint,
              }}
            >
              GHS Concierge ownership. Assigned by US state at the moment of capture.
            </p>
            <div
              style={{
                padding: '15px 16px',
                borderRadius: '4px',
                background: r.region ? C.panel : tone('attention').background,
                border: r.region ? '1px solid #eae7e0' : tone('attention').border,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={pill(r.region ? 'plain' : 'attention')}>
                  {r.region
                    ? `Region ${r.region}`
                    : r.reason === 'agent-signup'
                      ? 'No region — agent desk'
                      : 'No region — concierge desk'}
                </span>
                <span style={{ font: '500 13.5px/1.4 "IBM Plex Sans",sans-serif', color: C.navy }}>
                  {r.ownerName}
                </span>
              </div>
              <div
                style={{
                  font: '400 12px/1.4 "IBM Plex Mono",monospace',
                  color: C.body,
                  marginTop: '7px',
                  wordBreak: 'break-all',
                }}
              >
                {r.ownerEmail}
              </div>
              <div style={{ height: '1px', background: 'rgba(11,37,69,.09)', margin: '13px 0' }} />
              <div style={eyebrowBold}>Why this owner — {REASON_CODE[r.reason]}</div>
              <p
                style={{
                  margin: '6px 0 0',
                  font: '400 12.5px/1.6 "IBM Plex Sans",sans-serif',
                  color: '#243444',
                }}
              >
                {reasonText(l)}
              </p>
            </div>
            <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: `1px solid ${C.hair}` }}>
              <div style={{ ...eyebrowBold, color: C.faint }}>Financing — Account Executive</div>
              <p
                style={{
                  margin: '7px 0 0',
                  font: '400 12.5px/1.6 "IBM Plex Sans",sans-serif',
                  color: C.body,
                }}
              >
                {l.tk === 'agent'
                  ? 'Not applicable. Agent signups never enter the financing pipeline and are never assigned to an Account Executive.'
                  : l.ae
                    ? `${l.ae} picked up the financing thread. Account Executives are staffed nationally and are not region-routed — this assignment is separate from Concierge ownership.`
                    : 'No Account Executive assigned yet. Financing is handled by the AE team, separately from Concierge ownership.'}
              </p>
            </div>
          </div>

          <div style={{ ...card, padding: '20px 22px 22px' }}>
            <h3 style={{ ...h3Serif, marginBottom: '18px' }}>Stage history</h3>
            <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {STAGES.slice(0, si + 1).map(([key], i) => {
                const when = l.t - offsets[i]
                const last = i === si
                const team = i === 5 && l.tk === 'agent' ? 'Agent network desk' : STAGE_TEAMS[i]
                return (
                  <li key={key} style={{ display: 'flex', gap: '14px' }}>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        flex: '0 0 12px',
                      }}
                    >
                      <span
                        style={{
                          width: '9px',
                          height: '9px',
                          borderRadius: '50%',
                          marginTop: '5px',
                          background: last ? C.navy : '#fff',
                          border: `1.5px solid ${last ? C.navy : '#c3cbd3'}`,
                          flex: '0 0 9px',
                        }}
                      />
                      <span
                        style={{
                          flex: 1,
                          width: '1px',
                          background: last ? 'transparent' : C.line,
                          marginTop: '3px',
                        }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0, paddingBottom: '16px' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: '9px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <span
                          style={{
                            font: `${last ? '500' : '400'} 13px/1.4 "IBM Plex Sans",sans-serif`,
                            color: last ? C.navy : C.body,
                          }}
                        >
                          {stageLabel(key)}
                        </span>
                        <span
                          style={{ font: '400 11px/1.3 "IBM Plex Mono",monospace', color: C.faint }}
                        >
                          {short(when < 0 ? 0 : when)}
                        </span>
                      </div>
                      <div
                        style={{
                          font: '400 11.5px/1.5 "IBM Plex Sans",sans-serif',
                          color: C.muted,
                          marginTop: '3px',
                        }}
                      >
                        {actors[i] ? `${team} · ${actors[i]}` : team}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ol>
            <p
              style={{
                margin: '2px 0 0',
                font: '400 11.5px/1.5 "IBM Plex Sans",sans-serif',
                color: C.faint,
              }}
            >
              {si >= STAGES.length - 1
                ? 'End of pipeline.'
                : `Next: ${stageLabel(STAGES[si + 1][0])}. Stages after ${stageLabel(
                    l.st,
                  )} have not happened for this lead.`}
            </p>
          </div>
        </div>

        {/* Right column. */}
        <div
          style={{
            flex: '1.15 1 420px',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ ...card, overflow: 'hidden' }}>
            <div
              style={{
                padding: '18px 22px 14px',
                borderBottom: `1px solid ${C.hair}`,
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <h3 style={h3Serif}>Assistant transcript</h3>
              <span style={{ font: '400 11px/1.3 "IBM Plex Mono",monospace', color: C.faint }}>
                {transcript ? `${transcript.length} turns · ` : ''}sess_{l.sid}
              </span>
            </div>
            {transcript ? (
              <div
                style={{
                  maxHeight: '620px',
                  overflowY: 'auto',
                  padding: '18px 22px 22px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  background: C.sunken,
                }}
              >
                {transcript.map((m, i) => {
                  const isVisitor = m[0] === 'v'
                  const policy = m[2] === true
                  const turnAt = l.t + (transcript.length - i)
                  return (
                    <div
                      key={i}
                      style={{ display: 'flex', justifyContent: isVisitor ? 'flex-start' : 'flex-end' }}
                    >
                      <div
                        style={{
                          maxWidth: '86%',
                          padding: '11px 13px',
                          borderRadius: '5px',
                          background: isVisitor ? '#fff' : policy ? '#fbeeec' : '#eef2f8',
                          border: `1px solid ${isVisitor ? C.line : policy ? '#eed3ce' : '#dde4ee'}`,
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '6px',
                          }}
                        >
                          <span
                            style={{
                              font: '500 10.5px/1.3 "IBM Plex Sans",sans-serif',
                              letterSpacing: '.09em',
                              textTransform: 'uppercase',
                              color: isVisitor ? C.muted : '#2f5480',
                            }}
                          >
                            {isVisitor ? (l.tk === 'agent' ? 'Agent' : 'Visitor') : 'Assistant'}
                          </span>
                          {policy ? (
                            <span
                              style={pill('urgent', {
                                padding: '1px 6px',
                                font: '500 10px/1.4 "IBM Plex Sans",sans-serif',
                              })}
                            >
                              Policy — declined
                            </span>
                          ) : null}
                          <span
                            style={{
                              font: '400 10.5px/1.3 "IBM Plex Mono",monospace',
                              color: '#9aa5b0',
                              marginLeft: 'auto',
                            }}
                          >
                            {hhmm(turnAt)}
                          </span>
                        </div>
                        <p
                          style={{
                            margin: 0,
                            font: '400 12.5px/1.65 "IBM Plex Sans",sans-serif',
                            color: '#1b2b3a',
                          }}
                        >
                          {m[1]}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ padding: '40px 24px 44px', textAlign: 'center', background: C.sunken }}>
                <p
                  style={{
                    margin: '0 auto',
                    maxWidth: '42ch',
                    font: '400 12.5px/1.6 "IBM Plex Sans",sans-serif',
                    color: C.muted,
                  }}
                >
                  This session's transcript is not included in the demo dataset. In production the full
                  conversation is retained against the session id and rendered here.
                </p>
              </div>
            )}
          </div>

          <div style={{ ...card, padding: '20px 22px 22px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <h3 style={h3Serif}>Handoff email</h3>
              <span style={pill(sm.tone)}>
                <span style={dot(sm.tone)} />
                {sm.label}
              </span>
            </div>
            <p
              style={{
                margin: '8px 0 16px',
                font: '400 11.5px/1.5 "IBM Plex Sans",sans-serif',
                color: C.faint,
              }}
            >
              {statusNote}
            </p>
            <div style={{ border: `1px solid ${C.line}`, borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  padding: '14px 16px',
                  background: C.panel,
                  borderBottom: `1px solid ${C.line}`,
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr',
                  gap: '8px 14px',
                }}
              >
                <span style={{ font: '400 11px/1.5 "IBM Plex Sans",sans-serif', color: C.faint }}>
                  To
                </span>
                <span
                  style={{
                    font: '500 12px/1.5 "IBM Plex Mono",monospace',
                    color: C.navy,
                    wordBreak: 'break-all',
                  }}
                >
                  {em.to}
                </span>
                <span style={{ font: '400 11px/1.5 "IBM Plex Sans",sans-serif', color: C.faint }}>
                  Cc
                </span>
                <span
                  style={{
                    font: '400 12px/1.6 "IBM Plex Mono",monospace',
                    color: C.body,
                    wordBreak: 'break-all',
                  }}
                >
                  {em.cc.join(', ')}
                </span>
                <span style={{ font: '400 11px/1.5 "IBM Plex Sans",sans-serif', color: C.faint }}>
                  Subject
                </span>
                <span style={{ font: '500 12.5px/1.5 "IBM Plex Sans",sans-serif', color: C.navy }}>
                  {em.subject}
                </span>
              </div>
              <pre
                style={{
                  margin: 0,
                  padding: '16px',
                  background: '#fff',
                  font: '400 12px/1.75 "IBM Plex Mono",monospace',
                  color: '#243444',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {em.body}
              </pre>
            </div>
            <GhostButton
              onClick={() => onOpenEmailLog(l.id)}
              extra={{ marginTop: '14px', padding: '7px 12px' }}
            >
              Open in handoff log →
            </GhostButton>
          </div>
        </div>
      </div>
    </section>
  )
}
