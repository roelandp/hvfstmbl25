import { SHEET_BASE } from "./config";

export async function getSightseeing() {
  const res = await fetch(`${SHEET_BASE}/sightseeing`);
  if (!res.ok) throw new Error("Failed to fetch sightseeing data");
  return res.json();
}
