
import { SHEET_BASE } from './config';

export async function getSightseeing() {
  const res = await fetch(`https://opensheet.elk.sh/1DkUrxY1lb_IV-3o3vo-Q9hqsNvVfcfBg7fHa9S6TV60/sightseeing`);
  if (!res.ok) throw new Error('Failed to fetch sightseeing data');
  return res.json();
}
