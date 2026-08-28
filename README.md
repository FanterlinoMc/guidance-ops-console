# Guidance Ops Console

Operations console for Guidance Home Services — five linked screens showing what the
website assistant captured, who each lead was routed to, what email left the system,
and whether anyone has replied yet.

Implemented in React + TypeScript + Vite from the Claude Design handoff in
`project/Guidance Ops Console.dc.html` (design conversation in `chats/`).

**All data is fabricated demo data.** No backend, no live figures, no customer
information.

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build to dist/
npm run typecheck
```

## Screens

| Screen | What it answers |
| --- | --- |
| **Overview** | What came in, who owns it, has anyone answered. Opens with a four-step explainer of how a lead reaches a person, plus a Concierge vs. Account Executive split. |
| **Leads** | The full register, filterable by owner / track / stage, with a key decoding the status pills and an empty state. |
| **Lead detail** | One record end to end: captured fields, routing decision, stage history, assistant transcript, handoff email. |
| **Handoff emails** | Two-pane log of every routing email with recipients, delivery status and the exact body that left the system. |
| **Team & territories** | State-tile map coloured by Concierge region, region owners and load, the two desks, and the 16 uncovered states. |

## How it is organised

```
src/
  data/leads.ts       Sample data block — regions, 24 leads, transcripts, tile grid
  lib/routing.ts      Routing, first-reply targets, email composition (pure)
  lib/time.ts         Relative-time formatting off a single fixed reference instant
  lib/styles.ts       Tones, pills, chips, table and typography tokens
  components/         Sidebar, Header, Footer, GhostButton, SegmentedControl
  screens/            One component per screen
  App.tsx             Screen state and cross-screen navigation
```

### Routing is derived, not stored

No lead carries an owner. `route()` runs the real rules — track first, then US state
against the five region tables — every time a record is read, so every owner, region
pill, region card count, territory colour and email recipient on all five screens comes
from the same function. Swapping the `LEADS` array in `src/data/leads.ts` re-routes the
entire console with no other edits.

The rules, in order:

1. **Agent signups** go to the agent network desk. Never region-routed, never treated as
   financing leads.
2. **No state captured** → concierge desk, for a person to complete by hand.
3. **State in a region** → that region's Concierge owner.
4. **State in no region** → concierge desk for manual triage. Deliberately *not*
   reassigned to the nearest region.

First-reply target is one hour for homebuyers, three for agents; `sla()` derives
met / late / breached / due from that.

### Concierge and Account Executive stay separate

Region cards, the territory map and the routing block are Concierge-only. The Account
Executive assignment sits in its own labelled block on the lead detail screen, with a
note that AEs are staffed nationally and are not region-routed.

### Display toggles

The prototype exposed two tweaks as design-tool props; both are real controls here:

- **Density** (Comfortable / Compact) — in the Leads filter bar, changes table row padding.
- **Map fill** (Filled / Outline) — beside the territory grid heading, switches region
  tiles between solid colour and outline.

## Figures, checked against the design

Everything below is computed from the 24 records, not written down:

- 24 leads — 22 homebuyers, 2 agent signups
- Handoff emails: 18 sent, 5 queued, 1 failed
- 2 replies overdue, 11 awaiting a first reply, 2 with no owner assigned
- 5 regions covering 34 states and DC; **16 states uncovered**, hatched on the map
- Region load A=4, B=4, C=5, D=4, E=3
- `GHS-2041` (Yusuf Karim, Reston VA) is the showcase record: a 14-turn transcript in
  which the assistant declines a Social Security number, flagged as a policy turn

## Design source

The original handoff bundle is preserved:

- `project/Guidance Ops Console.dc.html` — the design prototype (template + logic)
- `project/support.js` — the Claude Design runtime the prototype ran on
- `chats/chat1.md` — the design conversation, including the two rounds of revisions
  (removing the Instagram channel, and the first-time-user orientation pass)
