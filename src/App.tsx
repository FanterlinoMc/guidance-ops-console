import { useState } from 'react'
import { LEADS, REGIONS } from './data/leads'
import { breachedLeads } from './lib/routing'
import { C } from './lib/styles'
import type { Density, EmailStatus, Filters, MapStyle, Screen } from './types'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { Overview } from './screens/Overview'
import { EMPTY_FILTERS, Leads } from './screens/Leads'
import { LeadDetail } from './screens/LeadDetail'
import { Emails } from './screens/Emails'
import { Team } from './screens/Team'

const TITLES: Record<Screen, [string, string]> = {
  overview: ['Overview', 'What came in, who owns it, and whether anyone has answered yet.'],
  leads: [
    'Leads',
    `All ${LEADS.length} sample captures from the assistant. Filter, then open a record.`,
  ],
  detail: [
    'Lead detail',
    'One record end to end — captured fields, transcript, routing decision and handoff email.',
  ],
  emails: [
    'Handoff emails',
    'Every routing email the assistant generated, with recipients and delivery status.',
  ],
  team: ['Team & territories', 'The five GHS Concierge regions, their owners, coverage and current load.'],
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('overview')
  const [leadId, setLeadId] = useState(LEADS[0].id)
  const [emailId, setEmailId] = useState(LEADS[0].id)
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [emailStatus, setEmailStatus] = useState<'all' | EmailStatus>('all')
  const [density, setDensity] = useState<Density>('Comfortable')
  const [mapStyle, setMapStyle] = useState<MapStyle>('Filled')

  const go = (next: Screen) => {
    setScreen(next)
    window.scrollTo(0, 0)
  }
  const openLead = (id: string) => {
    setLeadId(id)
    go('detail')
  }
  const openEmail = (id: string) => {
    setEmailId(id)
    go('emails')
  }

  const [title, subtitle] = TITLES[screen]

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', minHeight: '100vh', background: C.page }}>
      <Sidebar
        screen={screen}
        onNavigate={go}
        leadCount={LEADS.length}
        breachCount={breachedLeads().length}
        regionCount={REGIONS.length}
      />

      <main style={{ flex: '1 1 auto', minWidth: 0 }}>
        <Header title={title} subtitle={subtitle} />

        {screen === 'overview' ? <Overview onOpenLead={openLead} /> : null}

        {screen === 'leads' ? (
          <Leads
            filters={filters}
            onFilters={setFilters}
            density={density}
            onDensity={setDensity}
            onOpenLead={openLead}
          />
        ) : null}

        {screen === 'detail' ? (
          <LeadDetail leadId={leadId} onBack={() => go('leads')} onOpenEmailLog={openEmail} />
        ) : null}

        {screen === 'emails' ? (
          <Emails
            emailId={emailId}
            onSelect={setEmailId}
            status={emailStatus}
            onStatus={setEmailStatus}
            onOpenLead={openLead}
          />
        ) : null}

        {screen === 'team' ? <Team mapStyle={mapStyle} onMapStyle={setMapStyle} /> : null}

        <Footer leadCount={LEADS.length} />
      </main>
    </div>
  )
}
