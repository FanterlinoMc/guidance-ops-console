import { AGENT_DESK, CC, CHAN, DESK, GRID, LEADS, REGIONS, STAGES } from '../data/leads'
import type {
  EmailStatus,
  HandoffEmail,
  Lead,
  Region,
  RegionId,
  RouteResult,
  Sla,
  StageKey,
  ToneName,
} from '../types'
import { full, span } from './time'

/* ---------- stages ---------- */

export function stageIdx(k: StageKey): number {
  return STAGES.findIndex((s) => s[0] === k)
}

export function stageLabel(k: StageKey): string {
  const s = STAGES.find((x) => x[0] === k)
  return s ? s[1] : k
}

/* ---------- territories ---------- */

export function regionOf(ab: string): Region | null {
  return REGIONS.find((r) => r.states.indexOf(ab) >= 0) ?? null
}

/** Every state abbreviation claimed by a region. */
export function coveredStates(): string[] {
  return REGIONS.reduce<string[]>((a, r) => a.concat(r.states), [])
}

/** States on the tile map that no region claims, sorted. */
export function uncoveredStates(): string[] {
  const cov = coveredStates()
  return GRID.join(' ')
    .split(' ')
    .filter((a) => a !== '.' && cov.indexOf(a) < 0)
    .sort()
}

/* ---------- routing ----------
   Ownership is derived from the record every time it is read, never stored.
   Swapping the LEADS array re-routes the entire console. */

export function route(l: Lead): RouteResult {
  if (l.tk === 'agent') {
    return {
      region: null,
      reason: 'agent-signup',
      to: AGENT_DESK,
      owner: null,
      ownerEmail: AGENT_DESK,
      ownerName: 'Agent network desk',
    }
  }
  if (!l.s) {
    return {
      region: null,
      reason: 'no-state',
      to: DESK,
      owner: null,
      ownerEmail: DESK,
      ownerName: 'Concierge desk',
    }
  }
  const r = regionOf(l.s)
  if (r) {
    return { region: r.id, reason: 'region', to: r.email, owner: r, ownerEmail: r.email, ownerName: r.owner }
  }
  return {
    region: null,
    reason: 'state-uncovered',
    to: DESK,
    owner: null,
    ownerEmail: DESK,
    ownerName: 'Concierge desk',
  }
}

/** Label used wherever a region or a desk is named in one word. */
export function ownerLabel(r: RouteResult): string {
  if (r.region) return `Region ${r.region}`
  return r.reason === 'agent-signup' ? 'Agent desk' : 'Concierge desk'
}

/** Which team the owner sits on. */
export function ownerTeam(r: RouteResult): string {
  if (r.region) return 'GHS Concierge'
  return r.reason === 'agent-signup' ? 'Agent network' : 'Manual triage'
}

/* ---------- first-reply target ---------- */

/** Minutes allowed for a first reply: 1 hour for homebuyers, 3 for agents. */
export function slaMin(l: Lead): number {
  return l.tk === 'agent' ? 180 : 60
}

export function sla(l: Lead): Sla {
  const lim = slaMin(l)
  if (l.fc != null) {
    return l.fc <= lim
      ? { key: 'met', tone: 'settled', label: `Met · ${span(l.fc)}` }
      : { key: 'late', tone: 'attention', label: `Late · ${span(l.fc)}` }
  }
  const left = lim - l.t
  if (left < 0) return { key: 'breach', tone: 'urgent', label: `Breached by ${span(-left)}` }
  if (left <= 15) return { key: 'risk', tone: 'attention', label: `Due in ${span(left)}` }
  return { key: 'pending', tone: 'info', label: `Due in ${span(left)}` }
}

/* ---------- handoff email ---------- */

export function subject(l: Lead): string {
  const r = route(l)
  const where = l.s ? `${l.c}, ${l.s}` : 'state not captured'
  if (r.reason === 'agent-signup') return `Agent network signup — ${l.n} (${where})`
  if (r.reason === 'region') return `New homebuyer lead — ${where} — ${l.n}`
  return `Manual triage — ${where} — ${l.n}`
}

export function reasonText(l: Lead): string {
  const r = route(l)
  if (r.reason === 'region') {
    return `${l.s} is covered by Region ${r.region}, so the lead was assigned to ${r.owner!.owner} automatically at the moment of capture.`
  }
  if (r.reason === 'agent-signup') {
    return 'This is a real estate agent applying to the referral network, not a homebuyer. Agent signups are never routed to a region — they go to the agent network desk.'
  }
  if (r.reason === 'state-uncovered') {
    return `${l.s} is not covered by any Concierge region. The lead was sent to the concierge desk for manual triage and was deliberately not reassigned to the nearest region.`
  }
  return 'The conversation ended without a US state, so no region could be determined. The lead was sent to the concierge desk for a person to pick up and complete by hand.'
}

export const REASON_CODE: Record<RouteResult['reason'], string> = {
  region: 'matched by state',
  'agent-signup': 'agent signup, not a homebuyer',
  'no-state': 'no state was captured',
  'state-uncovered': 'state has no coverage',
}

export function emailBody(l: Lead): string {
  const L: string[] = []
  L.push(
    l.tk === 'agent'
      ? 'Agent network signup captured by the Guidance assistant.'
      : 'New homebuyer lead captured by the Guidance assistant.',
  )
  L.push('')
  L.push(`Name:      ${l.n}`)
  L.push(`Email:     ${l.e}`)
  L.push(`Phone:     ${l.p || 'Not captured'}`)
  L.push(`Location:  ${l.s ? `${l.c}, ${l.s}` : 'Not captured'}`)
  L.push(`${l.tk === 'agent' ? 'Available: ' : 'Timeline:  '}${l.tl}`)
  L.push(`Channel:   ${CHAN[l.ch]}`)
  L.push(`Captured:  ${full(l.t)}`)
  L.push(`Session:   sess_${l.sid}`)
  L.push('')
  L.push(`Routing: ${reasonText(l)}`)
  L.push('')
  L.push('No financial identifiers were collected. The assistant declines Social Security')
  L.push('numbers, bank account numbers and card details by design.')
  return L.join('\n')
}

/** Minutes between capture and the handoff email being composed. */
const COMPOSE_DELAY = 2

export function emailFor(l: Lead): HandoffEmail {
  const r = route(l)
  return {
    leadId: l.id,
    to: r.to,
    cc: CC,
    subject: subject(l),
    status: l.es,
    sentMin: l.es === 'queued' ? null : Math.max(0, l.t - COMPOSE_DELAY),
    queuedMin: l.t - COMPOSE_DELAY,
    region: r.region,
    reason: r.reason,
    ownerName: r.ownerName,
    body: emailBody(l),
    lead: l,
  }
}

export function statusMeta(s: EmailStatus): { tone: ToneName; label: string } {
  if (s === 'sent') return { tone: 'settled', label: 'Sent' }
  if (s === 'queued') return { tone: 'attention', label: 'Queued' }
  return { tone: 'urgent', label: 'Failed' }
}

/** Every handoff email, most recently composed first. */
export function allEmails(): HandoffEmail[] {
  return LEADS.map(emailFor).sort((a, b) => a.queuedMin - b.queuedMin)
}

/* ---------- aggregates ---------- */

export function breachedLeads(): Lead[] {
  return LEADS.filter((l) => sla(l).key === 'breach')
}

/** Leads with no owner: uncovered state, or no state at all. */
export function triageLeads(): Lead[] {
  return LEADS.filter((l) => {
    const r = route(l)
    return r.reason === 'state-uncovered' || r.reason === 'no-state'
  })
}

export function leadsForRegion(id: RegionId): Lead[] {
  return LEADS.filter((l) => route(l).region === id)
}
