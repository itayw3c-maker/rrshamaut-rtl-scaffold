export function slugCandidates(raw: string): string[] {
  const set = new Set<string>();
  const push = (s: string | undefined | null) => {
    if (typeof s === "string" && s.length > 0) set.add(s);
  };
  push(raw);
  try { push(decodeURIComponent(raw)); } catch { /* ignore */ }
  try { push(encodeURIComponent(raw)); } catch { /* ignore */ }
  try { push(raw.normalize("NFC")); } catch { /* ignore */ }
  try { push(decodeURIComponent(raw).normalize("NFC")); } catch { /* ignore */ }
  try { push(encodeURIComponent(decodeURIComponent(raw).normalize("NFC"))); } catch { /* ignore */ }
  return Array.from(set);
}

export function linkSlug(raw: string): string {
  let decoded = raw;
  try { decoded = decodeURIComponent(raw); } catch { /* keep as-is */ }
  try { decoded = decoded.normalize("NFC"); } catch { /* keep */ }
  return encodeURIComponent(decoded);
}
