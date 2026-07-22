// Central helper for internal link hrefs.
// - Encodes Hebrew (and other non-ASCII) path segments with encodeURIComponent
//   while preserving `/` separators.
// - Ensures the path part ends with exactly one trailing `/` (source site parity).
// - Idempotent: safe to call on already-encoded / already-slashed hrefs.
// - Leaves external links, tel:, mailto:, hash-only, protocol-relative, and `/` unchanged.

export function appHref(input: string): string {
  if (!input) return input;
  const s = String(input);

  // External / non-path schemes → leave alone.
  if (
    /^[a-z][a-z0-9+.-]*:/i.test(s) || // http:, https:, tel:, mailto:, etc.
    s.startsWith("//") ||
    s.startsWith("#")
  ) {
    return s;
  }

  // Homepage stays as `/`.
  if (s === "/" || s === "") return s;

  // Split off hash and query so we only normalize the path portion.
  let path = s;
  let hash = "";
  let query = "";
  const hashIdx = path.indexOf("#");
  if (hashIdx >= 0) {
    hash = path.slice(hashIdx);
    path = path.slice(0, hashIdx);
  }
  const qIdx = path.indexOf("?");
  if (qIdx >= 0) {
    query = path.slice(qIdx);
    path = path.slice(0, qIdx);
  }

  // Encode each segment (idempotent — decode first to avoid double-encoding).
  const encoded = path
    .split("/")
    .map((seg) => {
      if (!seg) return seg;
      let decoded = seg;
      try {
        decoded = decodeURIComponent(seg);
      } catch {
        /* keep as-is */
      }
      return encodeURIComponent(decoded);
    })
    .join("/");

  // Ensure exactly one trailing slash on the path (collapse duplicates).
  const withSlash = encoded.replace(/\/+$/, "") + "/";

  return withSlash + query + hash;
}
