export const SITE_CONFIG = {
  name: 'MINING DISCOVERY',
  tagline: 'Media, branding and investor engagement built for the mining ecosystem.',
  description:
    'Mining Discovery is a premium global digital media, branding, marketing and investor-engagement agency specializing in the mining ecosystem.',
  url: 'https://miningdiscovery.com',
  ogImage: '/images/og-image.jpg',
  contactEmail: 'connect@miningdiscovery.com',
};

export const NAV_LINKS = [
  { label: 'WORK', href: '#work' },
  { label: 'SERVICES', href: '#services' },
  { label: 'STORY', href: '#story' },
  { label: 'INSIGHTS', href: '#insights' },
  { label: 'NETWORK', href: '#network' },
] as const;

export const NAV_ACTIONS = [
  { label: 'ASK AI', href: '#ask-ai', isPrimary: false },
  { label: 'CONTACT', href: '#contact', isPrimary: true },
] as const;

export const SECTIONS_META = [
  { id: 'hero', number: '01', title: 'The Signal' },
  { id: 'ground-to-world', number: '02', title: 'From the Ground to the World' },
  { id: 'who-we-are', number: '03', title: 'Who We Are' },
  { id: 'journey', number: '04', title: 'Company Journey' },
  { id: 'mission-vision', number: '05', title: 'Mission & Vision' },
  { id: 'services', number: '06', title: 'Services' },
  { id: 'core-advantage', number: '07', title: 'Core Advantage' },
  { id: 'impact', number: '08', title: 'Impact & Results' },
  { id: 'case-studies', number: '09', title: 'Case Studies' },
  { id: 'portfolio', number: '10', title: 'Creative Archive' },
  { id: 'network', number: '11', title: 'Client Network' },
  { id: 'digital-products', number: '12', title: 'Digital Products' },
  { id: 'media', number: '13', title: 'Media & Publications' },
  { id: 'marketing-records', number: '14', title: 'Marketing Records' },
  { id: 'team', number: '15', title: 'Leadership Team' },
  { id: 'insights', number: '16', title: 'Intelligence & Insights' },
  { id: 'ask-ai', number: '17', title: 'Ask Mining Discovery AI' },
  { id: 'contact', number: '18', title: 'Initiate Contact' },
] as const;
