import { SHEET_BASE } from './config';

export async function getSchedule() {
  const res = await fetch(`${SHEET_BASE}/schedule`);
  if (!res.ok) throw new Error('Failed to fetch schedule');
  return res.json();
}