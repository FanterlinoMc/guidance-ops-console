import type { Channel, Lead, Region, StageKey, TranscriptTurn } from '../types'

/* ================= SAMPLE DATA — swap this block =================
   Fabricated demo records. Routing, SLA state and every figure on the
   screens is derived from this block at render time, never stored, so
   replacing LEADS re-routes the whole console. */

export const REGIONS: Region[] = [
  {
    id: 'A',
    owner: 'Salman Yousuf',
    email: 'salman.yousuf@guidancehomeservices.com',
    states: 'MN WI MI IA IL IN OH KS MO'.split(' '),
    color: '#3b5f8f',
  },
  {
    id: 'B',
    owner: 'Ryan Robinson',
    email: 'ryan.robinson@guidancehomeservices.com',
    states: 'NY MA CT RI'.split(' '),
    color: '#41757e',
  },
  {
    id: 'C',
    owner: 'Syed Ahmed',
    email: 'syed.ahmed@guidancehomeservices.com',
    states: 'PA NJ DE MD DC VA WV KY'.split(' '),
    color: '#6b6094',
  },
  {
    id: 'D',
    owner: 'Mudassir Abbasi',
    email: 'mudassir.abbasi@guidancehomeservices.com',
    states: 'CO AZ TX AR TN NC SC GA AL MS FL'.split(' '),
    color: '#8f6a52',
  },
  {
    id: 'E',
    owner: 'Arslan Amjad',
    email: 'arslan.amjad@guidancehomeservices.com',
    states: 'WA OR CA'.split(' '),
    color: '#4f7a5c',
  },
]

export const CC = [
  'concierge@guidancehomeservices.com',
  'rabbia.khan@guidancehomeservices.com',
  'adam.elsayed@guidancehomeservices.com',
]
export const DESK = 'concierge@guidancehomeservices.com'
export const AGENT_DESK = 'reasignup@guidancehomeservices.com'
export const ASSISTANT_FROM = 'assistant@guidancehomeservices.com'

export const LEADS: Lead[] = [
  { id: 'GHS-2041', n: 'Yusuf Karim', e: 'yusuf.karim@outlook.com', p: '(703) 555-0148', c: 'Reston', s: 'VA', tl: '3 months', ch: 'chat', tk: 'homebuyer', st: 'contacted', t: 185, fc: 22, es: 'sent', ae: 'Hamza Sheikh', sid: '9f2c41a8' },
  { id: 'GHS-2040', n: 'Aisha Rahman', e: 'aisha.rahman@gmail.com', p: '(630) 555-0193', c: 'Naperville', s: 'IL', tl: '6–12 months', ch: 'chat', tk: 'homebuyer', st: 'captured', t: 19, fc: null, es: 'sent', sid: '1c7b09de' },
  { id: 'GHS-2039', n: 'Bilal Ahmed', e: 'bilal.ahmed@gmail.com', p: '(718) 555-0126', c: 'Brooklyn', s: 'NY', tl: 'ASAP', ch: 'chat', tk: 'homebuyer', st: 'captured', t: 96, fc: null, es: 'queued', sid: '44e1b207' },
  { id: 'GHS-2038', n: 'Hannah Whitfield', e: 'h.whitfield@gmail.com', p: '(972) 555-0164', c: 'Plano', s: 'TX', tl: 'ASAP', ch: 'chat', tk: 'homebuyer', st: 'ae-assigned', t: 190, fc: null, es: 'sent', ae: 'Leila Haddad', sid: '6ba0f513' },
  { id: 'GHS-2037', n: 'David Chen', e: 'david.chen88@gmail.com', p: '(425) 555-0117', c: 'Bellevue', s: 'WA', tl: '3–6 months', ch: 'chat', tk: 'homebuyer', st: 'captured', t: 12, fc: null, es: 'queued', sid: '8d3c6f21' },
  { id: 'GHS-2036', n: 'Sarah Coyne', e: 'sarah.coyne@yahoo.com', p: '(401) 555-0175', c: 'Providence', s: 'RI', tl: '6–12 months', ch: 'chat', tk: 'homebuyer', st: 'ae-assigned', t: 38, fc: null, es: 'sent', ae: 'Sana Iqbal', sid: '2f91ac64' },
  { id: 'GHS-2035', n: 'Omar Haddad', e: 'omar.haddad@gmail.com', p: '(313) 555-0142', c: 'Dearborn', s: 'MI', tl: 'ASAP', ch: 'chat', tk: 'homebuyer', st: 'ae-assigned', t: 52, fc: null, es: 'sent', ae: 'Tomás Rivera', sid: '7e58b1d0' },
  { id: 'GHS-2034', n: 'Zainab Qureshi', e: 'zainab.q@gmail.com', p: '(678) 555-0108', c: 'Alpharetta', s: 'GA', tl: '3 months', ch: 'chat', tk: 'homebuyer', st: 'captured', t: 47, fc: null, es: 'failed', sid: '3a6d92fb' },
  { id: 'GHS-2033', n: 'Nadia Siddiqui', e: 'n.siddiqui@gmail.com', p: '(571) 555-0139', c: 'Fairfax', s: 'VA', tl: 'ASAP', ch: 'chat', tk: 'homebuyer', st: 'application-started', t: 4320, fc: 41, es: 'sent', ae: 'Hamza Sheikh', sid: '5c20e7a9' },
  { id: 'GHS-2032', n: 'Caleb Ostrander', e: 'caleb.ostrander@gmail.com', p: '(307) 555-0181', c: 'Casper', s: 'WY', tl: '3–6 months', ch: 'chat', tk: 'homebuyer', st: 'captured', t: 55, fc: null, es: 'queued', sid: 'b7f34c18' },
  { id: 'GHS-2031', n: 'Layla Mansour', e: 'layla.mansour@gmail.com', p: '(949) 555-0154', c: 'Irvine', s: 'CA', tl: '6–12 months', ch: 'chat', tk: 'homebuyer', st: 'contacted', t: 720, fc: 29, es: 'sent', ae: 'Sana Iqbal', sid: 'e91a6d37' },
  { id: 'GHS-2030', n: 'Mariam Haque', e: 'mariam.haque@gmail.com', p: '', c: '', s: '', tl: 'ASAP', ch: 'chat', tk: 'homebuyer', st: 'captured', t: 41, fc: null, es: 'queued', sid: 'c48b25e6' },
  { id: 'GHS-2029', n: 'Daniel Okafor', e: 'd.okafor@gmail.com', p: '(302) 555-0122', c: 'Wilmington', s: 'DE', tl: '6–12 months', ch: 'chat', tk: 'homebuyer', st: 'captured', t: 27, fc: null, es: 'queued', sid: '1b9e73f4' },
  { id: 'GHS-2028', n: 'Jordan Reyes', e: 'jordan.reyes@havenrealty.com', p: '(480) 555-0169', c: 'Tempe', s: 'AZ', tl: 'Immediately', ch: 'chat', tk: 'agent', st: 'captured', t: 95, fc: null, es: 'sent', sid: '9d02f6b5' },
  { id: 'GHS-2027', n: 'Grace Lindqvist', e: 'g.lindqvist@gmail.com', p: '(952) 555-0111', c: 'Eden Prairie', s: 'MN', tl: '12+ months', ch: 'chat', tk: 'homebuyer', st: 'contacted', t: 2880, fc: 18, es: 'sent', ae: 'Tomás Rivera', sid: '6f1c8a42' },
  { id: 'GHS-2026', n: 'Tyler Brennan', e: 'tyler.brennan@gmail.com', p: '(704) 555-0198', c: 'Charlotte', s: 'NC', tl: '3 months', ch: 'chat', tk: 'homebuyer', st: 'application-in-review', t: 11520, fc: 36, es: 'sent', ae: 'Leila Haddad', sid: '0e7d5b39' },
  { id: 'GHS-2025', n: 'Ibrahim Toure', e: 'i.toure@gmail.com', p: '(617) 555-0147', c: 'Quincy', s: 'MA', tl: '3 months', ch: 'chat', tk: 'homebuyer', st: 'contacted', t: 1260, fc: 47, es: 'sent', ae: 'Hamza Sheikh', sid: 'aa41e908' },
  { id: 'GHS-2022', n: 'Marcus Bell', e: 'marcus.bell@gmail.com', p: '(412) 555-0133', c: 'Pittsburgh', s: 'PA', tl: '3–6 months', ch: 'chat', tk: 'homebuyer', st: 'contacted', t: 1510, fc: 54, es: 'sent', ae: 'Sana Iqbal', sid: '52c9f7b1' },
  { id: 'GHS-2020', n: 'Peter Novak', e: 'p.novak@gmail.com', p: '(503) 555-0177', c: 'Portland', s: 'OR', tl: '3 months', ch: 'chat', tk: 'homebuyer', st: 'application-started', t: 7200, fc: 44, es: 'sent', ae: 'Tomás Rivera', sid: 'cd38a06e' },
  { id: 'GHS-2019', n: 'Rashid Malik', e: 'rashid.malik@gmail.com', p: '(614) 555-0159', c: 'Columbus', s: 'OH', tl: '3 months', ch: 'chat', tk: 'homebuyer', st: 'application-started', t: 8640, fc: 27, es: 'sent', ae: 'Leila Haddad', sid: '71b4d2c5' },
  { id: 'GHS-2016', n: 'Elena Marchetti', e: 'e.marchetti@gmail.com', p: '(860) 555-0104', c: 'Hartford', s: 'CT', tl: 'ASAP', ch: 'chat', tk: 'homebuyer', st: 'approved', t: 25920, fc: 25, es: 'sent', ae: 'Hamza Sheikh', sid: '39f7e6ba' },
  { id: 'GHS-2014', n: 'Fatima Noor', e: 'fatima.noor@gmail.com', p: '(502) 555-0188', c: 'Louisville', s: 'KY', tl: '3 months', ch: 'chat', tk: 'homebuyer', st: 'application-in-review', t: 17280, fc: 96, es: 'sent', ae: 'Sana Iqbal', sid: '8c5a1e70' },
  { id: 'GHS-2013', n: 'Priya Raman', e: 'priya@ramanrealtygroup.com', p: '(916) 555-0113', c: 'Sacramento', s: 'CA', tl: 'Immediately', ch: 'chat', tk: 'agent', st: 'contacted', t: 3600, fc: 118, es: 'sent', sid: '4d6f83c2' },
  { id: 'GHS-2011', n: 'Amina Diallo', e: 'amina.diallo@gmail.com', p: '(407) 555-0166', c: 'Orlando', s: 'FL', tl: 'ASAP', ch: 'chat', tk: 'homebuyer', st: 'closed', t: 40320, fc: 21, es: 'sent', ae: 'Leila Haddad', sid: 'e2039bcf' },
]

export const TRANSCRIPTS: Record<string, TranscriptTurn[]> = {
  'GHS-2041': [
    ['v', 'Do you offer riba-free home financing in Virginia?'],
    ['a', 'Yes. Guidance offers Shariah-compliant home financing across Virginia through a declining balance co-ownership structure — you and the co-owner hold shares in the property and your monthly payment steadily buys out that share. There is no interest-bearing loan involved, and the structure is reviewed by an independent Shariah supervisory board.'],
    ['v', 'If there is no interest, how is the monthly payment worked out?'],
    ['a', 'Your payment has two parts: an acquisition payment that increases your ownership share, and a profit payment for the use of the share you do not yet own. The profit rate is agreed at the outset and disclosed in full. As your share grows, the profit portion falls.'],
    ['v', 'We are looking in Reston, somewhere around $650k, and hoping to move in about three months.'],
    ['a', 'That is a workable timeline. Two teams can help: an Account Executive for the financing itself, and our GHS Concierge team, who can introduce you to a vetted real estate agent in Northern Virginia. May I take your name, email and phone number so the right person can follow up?'],
    ['v', 'Yusuf Karim, yusuf.karim@outlook.com, 703-555-0148.'],
    ['a', 'Thank you, Yusuf. I have noted Reston, VA, a target of roughly three months, and that you are interested in both financing and an agent introduction.'],
    ['v', 'Do you need my social security number now to check what I qualify for?'],
    ['a', 'No — and I am not able to take it here. I cannot collect Social Security numbers, bank account numbers or card details in this chat. Any identity or credit verification happens later, directly with a licensed Account Executive inside a secure application. Nothing sensitive is stored in this conversation.', true],
    ['v', 'Understood. Will my credit be pulled before I speak to someone?'],
    ['a', 'No. A credit review only happens once you choose to start an application and give consent at that point. This conversation does not trigger anything.'],
    ['v', 'Great. Please have someone reach out.'],
    ['a', 'Done. I am handing you to the GHS Concierge owner for Virginia — Syed Ahmed, Region C — and he or a colleague will be in touch within the hour. You will also get a copy of the financing overview by email.'],
  ],
  'GHS-2030': [
    ['v', 'Salaam, I want to know if this financing works for a first home.'],
    ['a', 'It does. The declining balance co-ownership structure is used by many first-time buyers, and the process is the same. To point you to the right person, which state are you buying in?'],
    ['v', 'Still deciding — we are weighing up two different cities for work reasons.'],
    ['a', 'That is fine, nothing is fixed at this stage. Can I take your name and email so a colleague can send you the eligibility overview once you have narrowed it down?'],
    ['v', 'Mariam Haque, mariam.haque@gmail.com. I would rather not give a phone number yet.'],
    ['a', 'Noted, email only. I will pass this to our concierge desk. Because no state is on file, a person will pick this up by hand rather than it being routed automatically.'],
  ],
  'GHS-2032': [
    ['v', 'Is Guidance financing available in Wyoming?'],
    ['a', 'Financing availability varies by state, and I do not want to guess. Let me take your details so a colleague can confirm exactly what is available for Wyoming.'],
    ['v', 'Caleb Ostrander, caleb.ostrander@gmail.com, 307-555-0181. Casper, WY. Looking in the next three to six months.'],
    ['a', 'Thank you. Wyoming sits outside our current Concierge regions, so this goes to the concierge desk for manual triage rather than to a regional owner.'],
    ['v', 'Fine, as long as someone actually replies.'],
    ['a', 'Someone will. I have flagged it as needing manual assignment.'],
  ],
  'GHS-2039': [
    ['v', 'a friend recommended you — is this actually halal or just interest with a different name?'],
    ['a', 'A fair question. It is a co-ownership structure, not a renamed loan: there is no interest-bearing debt, and an independent Shariah supervisory board reviews the contracts. I can send you the structure in writing.'],
    ['v', 'ok yes please. brooklyn, need to move asap, lease ends soon'],
    ['a', 'Understood — Brooklyn, and an urgent timeline. Can I take your name, email and phone so the right person can call you?'],
    ['v', 'Bilal Ahmed, bilal.ahmed@gmail.com, 718-555-0126'],
    ['a', 'Thank you, Bilal. I am handing this to the GHS Concierge owner for New York now.'],
  ],
  'GHS-2028': [
    ['v', 'I am a licensed agent in Arizona. How do I get referrals from Guidance?'],
    ['a', 'We keep a vetted referral network of agents who work with Shariah-compliant buyers. That is handled by our agent network desk, not by the financing team. Can I take your name, brokerage email and phone number?'],
    ['v', 'Jordan Reyes, jordan.reyes@havenrealty.com, 480-555-0169. Haven Realty, Tempe AZ. Ready to start immediately.'],
    ['a', 'Thank you. Agent applications are not routed by region — this goes straight to the agent network desk, who will send you the vetting requirements.'],
    ['v', 'Do you need my license number in here?'],
    ['a', 'Not in this chat. Licensing and identity checks are handled on the application form the desk will send you.', true],
  ],
}

/** Tile map of the US, 11 columns wide. '.' is an empty cell. */
export const GRID = [
  '. . . . . . . . . . ME',
  '. . . . . . . . VT NH .',
  'WA MT ND MN WI . MI . NY MA .',
  'OR ID SD IA IL IN OH PA NJ CT RI',
  'NV WY NE MO KY WV VA MD DE . .',
  'CA UT CO KS AR TN NC DC . . .',
  '. AZ NM OK MS AL SC GA . . .',
  'AK HI TX LA . . FL . . . .',
]

/* ================= END SAMPLE DATA ================= */

export const STAGES: [StageKey, string][] = [
  ['visitor', 'Visitor'],
  ['engaged', 'Engaged'],
  ['qualified', 'Qualified'],
  ['captured', 'Captured'],
  ['ae-assigned', 'AE assigned'],
  ['contacted', 'Contacted'],
  ['application-started', 'Application started'],
  ['application-in-review', 'Application in review'],
  ['approved', 'Approved'],
  ['closed', 'Closed'],
]

export const CHAN: Record<Channel, string> = { chat: 'Website chat' }
