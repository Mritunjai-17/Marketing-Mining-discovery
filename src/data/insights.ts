export interface InsightArticle {
  id: string;
  title: string;
  date: string;
  readTime: string;
  category: string;
  excerpt: string;
}

export const INSIGHTS_ARTICLES: InsightArticle[] = [
  {
    id: 'art-1',
    title: 'The Great Decarbonization Capital Shift: Why Mining Storytelling Matters',
    date: 'OCT 24, 2025',
    readTime: '6 MIN READ',
    category: 'Capital Markets',
    excerpt:
      'Institutional investors are shifting billions into critical minerals, yet junior explorers fail to articulate their strategic value.',
  },
  {
    id: 'art-2',
    title: 'Beyond the NI 43-101: Communicating Technical Asset Depth to Non-Technical Funds',
    date: 'NOV 12, 2025',
    readTime: '8 MIN READ',
    category: 'Media Strategy',
    excerpt:
      'How modern digital agencies bridge the gap between rigorous drill results and investor conviction.',
  },
];
