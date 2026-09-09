import { Service } from '@/types/service';

export const CORE_SERVICES: Service[] = [
  {
    id: 'srv-1',
    code: '01',
    title: 'Editorial & Strategic Media',
    tagline: 'Transforming technical geological data into compelling global narratives.',
    description:
      'We craft documentaries, high-impact press campaigns, and executive leadership profiles that resonate with institutional markets.',
    capabilities: ['Documentary Production', 'Investigative Media', 'CEO & Board Positioning', 'Crisis Media Strategy'],
    deliverables: ['Cinematic Brand Films', 'Financial Press Distribution', 'Global Media Placement'],
  },
  {
    id: 'srv-2',
    code: '02',
    title: 'Investor Engagement Architecture',
    tagline: 'Direct, data-driven connections to institutional and family office capital.',
    description:
      'We build digital platforms and campaign infrastructure designed to maximize capital market visibility and institutional interest.',
    capabilities: ['Institutional Roadshows', 'Interactive Prospectus Design', 'Real-Time Valuation Dashboards', 'Cap Table Engagement'],
    deliverables: ['Digital Investor Hubs', 'Interactive Pitch Decks', 'Global Capital Summit Presence'],
  },
  {
    id: 'srv-3',
    code: '03',
    title: 'Mining Ecosystem Brand Identity',
    tagline: 'Elevating resource assets into premier market-recognized brands.',
    description:
      'From junior explorers needing immediate capital differentiation to global majors redefining their ESG commitment, we shape lasting visual authority.',
    capabilities: ['Visual Identity Systems', 'Architectural Web Design', '3D Asset Visualization', 'ESG Report Crafting'],
    deliverables: ['Brand Guidelines', 'Enterprise Design Tokens', 'Global Web Applications'],
  },
];
