export type RegionId = 'A' | 'B' | 'C' | 'D' | 'E'

export interface Region {
  id: RegionId
  owner: string
  email: string
  states: string[]
  color: string
}

export type Track = 'homebuyer' | 'agent'
export type Channel = 'chat'
export type EmailStatus = 'sent' | 'queued' | 'failed'

export type StageKey =
  | 'visitor'
  | 'engaged'
  | 'qualified'
  | 'captured'
  | 'ae-assigned'
  | 'contacted'
  | 'application-started'
  | 'application-in-review'
  | 'approved'
  | 'closed'

export interface Lead {
  /** Record id, e.g. GHS-2041. */
  id: string
  /** Name. */
  n: string
  /** Email. */
  e: string
  /** Phone — empty string when not captured. */
  p: string
  /** City — empty string when not captured. */
  c: string
  /** US state abbreviation — empty string when not captured. */
  s: string
  /** Timeline / availability, free text. */
  tl: string
  /** Capture channel. */
  ch: Channel
  /** Track. */
  tk: Track
  /** Current pipeline stage. */
  st: StageKey
  /** Minutes since capture. */
  t: number
  /** Minutes from capture to first contact, or null if nobody has replied. */
  fc: number | null
  /** Handoff email status. */
  es: EmailStatus
  /** Account Executive, when one has picked up the financing thread. */
  ae?: string
  /** Assistant session id suffix. */
  sid: string
}

/** ['v' | 'a', text, isPolicyTurn?] */
export type TranscriptTurn = ['v' | 'a', string] | ['v' | 'a', string, true]

/** Why a lead landed where it did. */
export type RouteReason = 'region' | 'agent-signup' | 'no-state' | 'state-uncovered'

export interface RouteResult {
  region: RegionId | null
  reason: RouteReason
  to: string
  owner: Region | null
  ownerEmail: string
  ownerName: string
}

export type ToneName = 'urgent' | 'attention' | 'settled' | 'info' | 'neutral' | 'plain'

export type SlaKey = 'met' | 'late' | 'breach' | 'risk' | 'pending'

export interface Sla {
  key: SlaKey
  tone: ToneName
  label: string
}

export interface HandoffEmail {
  leadId: string
  to: string
  cc: string[]
  subject: string
  status: EmailStatus
  /** Minutes ago the mail was dispatched; null while queued. */
  sentMin: number | null
  /** Minutes ago the mail was composed. */
  queuedMin: number
  region: RegionId | null
  reason: RouteReason
  ownerName: string
  body: string
  lead: Lead
}

export type Screen = 'overview' | 'leads' | 'detail' | 'emails' | 'team'

/** 'desk' = concierge desk (no region), 'agent' = agent network desk. */
export type RegionFilter = 'all' | RegionId | 'desk' | 'agent'

export interface Filters {
  region: RegionFilter
  track: 'all' | Track
  stage: 'all' | StageKey
}

export type Density = 'Comfortable' | 'Compact'
export type MapStyle = 'Filled' | 'Outline'
