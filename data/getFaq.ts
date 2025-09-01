import { SHEET_BASE } from './config';

export interface FaqItem {
  id: string;
  category: string;
  title: string;
  description: string;
}

export async function getFaq(): Promise<FaqItem[]> {
  const res = await fetch(`${SHEET_BASE}/faq`);
  if (!res.ok) throw new Error('Failed to fetch FAQ data');
  return res.json();
}
