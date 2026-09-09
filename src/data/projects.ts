import { Project } from '@/types/project';

export const FEATURED_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    title: 'Re-Architecting Global Copper Perception',
    slug: 'global-copper-perception',
    category: 'Branding',
    client: 'Tier-1 Copper Producer',
    year: '2025',
    summary:
      'Engineered an editorial-grade campaign connecting critical mineral extraction with global decarbonization narrative.',
    thumbnail: '/images/projects/copper.jpg',
    featured: true,
    metrics: [
      { label: 'Institutional Reach', value: '4.2M+' },
      { label: 'Capital Inflow Attributed', value: '$180M' },
    ],
    tags: ['Brand Strategy', 'Investor Media', 'Cinematography'],
  },
  {
    id: 'proj-2',
    title: 'The Underground Autonomy Series',
    slug: 'underground-autonomy-series',
    category: 'Documentary',
    client: 'NextGen Mining Robotics',
    year: '2025',
    summary:
      'A cinematic 4-part intelligence series highlighting automated extraction technologies across remote jurisdictions.',
    thumbnail: '/images/projects/robotics.jpg',
    featured: true,
    metrics: [
      { label: 'Global Video Views', value: '1.8M' },
      { label: 'Tier-1 Press Features', value: '14' },
    ],
    tags: ['Editorial Media', 'Documentary Film', 'Tech Positioning'],
  },
  {
    id: 'proj-3',
    title: 'Institutional Investor Summit Digital Hub',
    slug: 'investor-summit-hub',
    category: 'Digital Platform',
    client: 'Precious Metals Capital Group',
    year: '2024',
    summary:
      'Real-time interactive intelligence hub connecting fund managers with mineral deposit valuation models.',
    thumbnail: '/images/projects/hub.jpg',
    featured: true,
    metrics: [
      { label: 'Active Fund Managers', value: '1,400+' },
      { label: 'Average Engagement', value: '18m 40s' },
    ],
    tags: ['Web Application', 'Data Visualization', 'Investor UX'],
  },
];
