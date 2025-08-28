import { SHEET_BASE } from './config';

export async function getVenues() {
  const res = await fetch(`${SHEET_BASE}/venues`);
  if (!res.ok) throw new Error('Failed to fetch venues');
  return res.json();
}