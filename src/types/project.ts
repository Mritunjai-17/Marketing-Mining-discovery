export interface Project {
  id: string;
  title: string;
  slug: string;
  category: 'Branding' | 'Investor Campaign' | 'Digital Platform' | 'Documentary' | 'Media Strategy';
  client: string;
  year: string;
  summary: string;
  thumbnail: string;
  featured: boolean;
  metrics?: Array<{
    label: string;
    value: string;
  }>;
  tags: string[];
}
