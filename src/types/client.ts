export interface Client {
  id: string;
  name: string;
  ticker?: string;
  exchange?: string;
  sector: 'Gold & Precious Metals' | 'Critical Minerals' | 'Copper & Base Metals' | 'Energy Transition' | 'Mining Tech';
  headquarters: string;
  logoUrl?: string;
  tier: 'Global Major' | 'Mid-Tier Producer' | 'High-Grade Explorer' | 'Ecosystem Partner';
}
