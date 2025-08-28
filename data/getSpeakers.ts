import { SHEET_BASE } from './config';

export async function getSpeakers() {
  const res = await fetch(`${SHEET_BASE}/speakers`);
  if (!res.ok) throw new Error('Failed to fetch speakers');
  return res.json();
}