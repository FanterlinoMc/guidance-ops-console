import type { CSSProperties } from 'react'
import { ASSISTANT_FROM } from '../data/leads'
import { allEmails, statusMeta } from '../lib/routing'
import { ago, full, short } from '../lib/time'
import {
  C,
  card,
  chip,
  dot,
  fieldMissing,
  fieldMono,
  fieldValue,
  h3Serif,
  pill,
  primaryButton,
  tone,
} from '../lib/styles'
import { useHover } from '../lib/useHover'
import type { EmailStatus, HandoffEmail, ToneName } from '../types'

interface EmailsProps {
  emailId: string
  onSelect: (leadId: string) => void
  status: 'all' | EmailStatus
  onStatus: (s: 'all' | EmailStatus) => void
  onOpenLead: (id: string) => void
}

function regionLabel(e: HandoffEmail): string {
  if (e.region) return `Region ${e.region}`
  return e.reason === 'agent-signup' ? 'Agent desk' : 'Concierge desk'
}

/** What a reader most needs to know about this message's delivery. */
function bannerFor(e: HandoffEmail): { tone: ToneName; title: string; body: string } {
  if (e.status === 'queued') {
    return {
      tone: 'attention',
      title: 'Queued — not delivered',
      body: `This email is composed and sitting in the outbox. Dispatch is manual in the live system today, so nobody has been notified yet. ${e.ownerName} cannot act on this lead until it is sent.`,
    }
  }
  if (e.status === 'failed') {
    return {
      tone: 'urgent',
      title: 'Delivery failed',
      body: `The mail server rejected this message as undeliverable and there is no automatic retry. ${e.ownerName} has not seen this lead.`,
    }
  }
  return {
    tone: 'settled',
    title: 'Delivered',
    body: `Sent to ${e.ownerName} ${ago(
      e.sentMin!,
    )} with the standard concierge CC list. The customer details below are exactly what left the system.`,
  }
}

function LogItem({
  email,
  active,
  onClick,
}: {
  email: HandoffEmail
  active: boolean
  onClick: () => void
}) {
  const m = statusMeta(email.status)
  const hover = useHover(
    {
      display: 'block',
      width: '100%',
      textAlign: 'left' as const,
      padding: '13px 18px',
      cursor: 'pointer',
      border: 'none',
      borderBottom: `1px solid ${C.hair}`,
      borderLeft: `3px solid ${active ? C.navy : 'transparent'}`,
      background: active ? C.panel : '#fff',
    },
    active ? {} : { background: '#faf9f6' },
  )

  return (
    <button type="button" onClick={onClick} aria-current={active ? 'true' : undefined} {...hover}>
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
        <span
          style={{
            font: '500 12.5px/1.4 "IBM Plex Sans",sans-serif',
            color: C.navy,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {email.subject}
        </span>
        <span
          style={pill(m.tone, { padding: '2px 7px', font: '500 10.5px/1.4 "IBM Plex Sans",sans-serif' })}
        >
          <span style={dot(m.tone)} />
          {m.label}
        </span>
      </span>
      <span
        style={{
          display: 'block',
          font: '400 11.5px/1.5 "IBM Plex Mono",monospace',
          color: '#5b6b7a',
          marginTop: '6px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {email.to}
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '7px' }}>
        <span
          style={pill(email.region ? 'plain' : 'attention', {
            padding: '1px 6px',
            font: '500 10.5px/1.4 "IBM Plex Sans",sans-serif',
          })}
        >
          {regionLabel(email)}
        </span>
        <span style={{ font: '400 11px/1.3 "IBM Plex Mono",monospace', color: C.faint }}>
          {email.status === 'queued' ? `queued ${ago(email.queuedMin)}` : short(email.sentMin!)}
        </span>
      </span>
    </button>
  )
}

export function Emails({ emailId, onSelect, status, onStatus, onOpenLead }: EmailsProps) {
  const all = allEmails()
  const counts: Record<'all' | EmailStatus, number> = {
    all: all.length,
    sent: 0,
    queued: 0,
    failed: 0,
  }
  all.forEach((e) => {
    counts[e.status] += 1
  })

  const shown = all.filter((e) => status === 'all' || e.status === status)
  const selected = all.find((e) => e.leadId === emailId) ?? shown[0] ?? all[0]
  const sm = statusMeta(selected.status)
  const banner = bannerFor(selected)
  const bt = tone(banner.tone)

  const statusChips: ['all' | EmailStatus, string][] = [
    ['all', `All ${counts.all}`],
    ['sent', `Sent ${counts.sent}`],
    ['queued', `Queued ${counts.queued}`],
    ['failed', `Failed ${counts.failed}`],
  ]

  const details: { label: string; value: string; style: CSSProperties }[] = [
    { label: 'Name', value: selected.lead.n, style: fieldValue },
    { label: 'Email', value: selected.lead.e, style: fieldMono },
    {
      label: 'Phone',
      value: selected.lead.p || 'Not captured',
      style: selected.lead.p ? fieldMono : fieldMissing,
    },
    {
      label: 'Location',
      value: selected.lead.s ? `${selected.lead.c}, ${selected.lead.s}` : 'Not captured',
      style: selected.lead.s ? fieldValue : fieldMissing,
    },
    {
      label: selected.lead.tk === 'agent' ? 'Availability' : 'Timeline',
      value: selected.lead.tl,
      style: fieldValue,
    },
    {
      label: 'Region owner',
      value: selected.region
        ? `Region ${selected.region} — ${selected.ownerName}`
        : `${selected.ownerName} (no region owner)`,
      style: fieldValue,
    },
    {
      label: 'Sensitive',
      value:
        'None. SSN, account and card numbers are refused by the assistant and never included.',
      style: fieldValue,
    },
  ]

  const metaLabel: CSSProperties = {
    font: '400 11px/1.6 "IBM Plex Sans",sans-serif',
    color: C.faint,
  }
  const metaValue: CSSProperties = {
    font: '400 12px/1.6 "IBM Plex Mono",monospace',
    color: C.body,
  }

  const openLead = useHover(primaryButton, { background: C.link, border: `1px solid ${C.link}` })

  return (
    <section aria-label="Handoff emails" style={{ padding: '22px 34px 46px' }}>
      <div
        style={{
          ...card,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '14px',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {statusChips.map(([v, label]) => (
            <button
              key={v}
              type="button"
              aria-pressed={status === v}
              onClick={() => onStatus(v)}
              style={chip(status === v)}
            >
              {label}
            </button>
          ))}
        </div>
        <p
          style={{
            margin: 0,
            font: '400 11.5px/1.5 "IBM Plex Sans",sans-serif',
            color: C.muted,
            maxWidth: '52ch',
          }}
        >
          Dispatch is manual today. <strong style={{ fontWeight: 500, color: '#7a5000' }}>Queued</strong>{' '}
          means the email is composed and waiting in the outbox — it has not been delivered.
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          marginTop: '14px',
          alignItems: 'flex-start',
        }}
      >
        {/* Log. */}
        <div style={{ ...card, flex: '1 1 356px', minWidth: 0, overflow: 'hidden' }}>
          <div
            style={{
              padding: '15px 18px 13px',
              borderBottom: `1px solid ${C.hair}`,
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: '10px',
            }}
          >
            <h2 style={{ ...h3Serif }}>Routing log</h2>
            <span style={{ font: '400 11px/1.3 "IBM Plex Sans",sans-serif', color: C.faint }}>
              {shown.length} of {all.length}
            </span>
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: '760px', overflowY: 'auto' }}>
            {shown.map((e) => (
              <li key={e.leadId}>
                <LogItem
                  email={e}
                  active={e.leadId === selected.leadId}
                  onClick={() => onSelect(e.leadId)}
                />
              </li>
            ))}
          </ul>
        </div>

        {/* Reader. */}
        <div
          style={{
            flex: '1.5 1 500px',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div
            style={{
              padding: '14px 16px',
              borderRadius: '5px',
              color: bt.color,
              background: bt.background,
              border: bt.border,
            }}
          >
            <span
              style={{
                font: '600 10.5px/1.4 "IBM Plex Sans",sans-serif',
                letterSpacing: '.1em',
                textTransform: 'uppercase',
              }}
            >
              {banner.title}
            </span>
            <p style={{ margin: '6px 0 0', font: '400 12.5px/1.6 "IBM Plex Sans",sans-serif' }}>
              {banner.body}
            </p>
          </div>

          <div style={{ ...card, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px 18px', borderBottom: `1px solid ${C.line}` }}>
              <h2
                style={{
                  margin: 0,
                  font: '500 17px/1.35 "IBM Plex Serif",Georgia,serif',
                  color: C.navy,
                }}
              >
                {selected.subject}
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr',
                  gap: '9px 16px',
                  marginTop: '16px',
                }}
              >
                <span style={metaLabel}>From</span>
                <span style={metaValue}>{ASSISTANT_FROM}</span>

                <span style={metaLabel}>To</span>
                <span
                  style={{
                    font: '500 12px/1.6 "IBM Plex Mono",monospace',
                    color: C.navy,
                    wordBreak: 'break-all',
                  }}
                >
                  {selected.to}
                </span>

                <span style={metaLabel}>Cc</span>
                <span style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selected.cc.map((c) => (
                    <span
                      key={c}
                      style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        background: '#f2f1ec',
                        border: `1px solid ${C.line}`,
                        borderRadius: '3px',
                        font: '400 11.5px/1.4 "IBM Plex Mono",monospace',
                        color: C.body,
                      }}
                    >
                      {c}
                    </span>
                  ))}
                </span>

                <span style={metaLabel}>{selected.status === 'queued' ? 'Queued' : 'Sent'}</span>
                <span style={metaValue}>
                  {selected.status === 'queued'
                    ? `${full(selected.queuedMin)} (not dispatched)`
                    : full(selected.sentMin!)}
                </span>

                <span style={metaLabel}>Status</span>
                <span>
                  <span style={pill(sm.tone)}>
                    <span style={dot(sm.tone)} />
                    {sm.label}
                  </span>
                </span>
              </div>
            </div>

            <pre
              style={{
                margin: 0,
                padding: '22px 24px',
                font: '400 12.5px/1.8 "IBM Plex Mono",monospace',
                color: '#243444',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                background: C.sunken,
              }}
            >
              {selected.body}
            </pre>

            <div
              style={{
                padding: '16px 24px 18px',
                borderTop: `1px solid ${C.line}`,
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ font: '400 11.5px/1.5 "IBM Plex Sans",sans-serif', color: C.faint }}>
                Lead {selected.leadId} · {selected.lead.n}
              </span>
              <button type="button" onClick={() => onOpenLead(selected.leadId)} {...openLead}>
                Open lead record →
              </button>
            </div>
          </div>

          <div style={{ ...card, padding: '18px 22px 20px' }}>
            <h3
              style={{
                margin: '0 0 14px',
                font: '500 13.5px/1.3 "IBM Plex Serif",Georgia,serif',
                color: C.navy,
              }}
            >
              Customer details included
            </h3>
            <dl
              style={{
                margin: 0,
                display: 'grid',
                gridTemplateColumns: 'minmax(90px,auto) 1fr',
                gap: '10px 18px',
              }}
            >
              {details.map((d) => (
                <div key={d.label} style={{ display: 'contents' }}>
                  <dt style={{ font: '400 11.5px/1.5 "IBM Plex Sans",sans-serif', color: C.faint }}>
                    {d.label}
                  </dt>
                  <dd style={d.style}>{d.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  )
}
