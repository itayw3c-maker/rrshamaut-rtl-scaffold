const CHATGPT_ATTR_RE =
  /(data-testid|data-scroll-anchor|data-message-author-role|data-message-id)\s*=/i;
const CHATGPT_CLASS_RE =
  /class\s*=\s*"[^"]*(text-token-|thread-trailing|conversation-turn|scroll-mb-\[|markdown\s|prose\b)[^"]*"/i;

function stripTagBlock(html: string, tag: string): string {
  const re = new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, "gi");
  let prev = ""; let cur = html; let safety = 30;
  while (cur !== prev && safety-- > 0) { prev = cur; cur = cur.replace(re, ""); }
  return cur;
}

function unwrapChatGptDivs(html: string): string {
  const tagRe = /<div\b([^>]*)>([\s\S]*?)<\/div>/gi;
  let prev = ""; let cur = html; let safety = 25;
  while (cur !== prev && safety-- > 0) {
    prev = cur;
    cur = cur.replace(tagRe, (full, attrs, inner) =>
      (CHATGPT_ATTR_RE.test(attrs) || CHATGPT_CLASS_RE.test(attrs)) ? inner : full);
  }
  return cur;
}

function stripShortcodes(html: string): string {
  let out = html;
  out = out.replace(/\[(\w+)[^\]]*\][\s\S]*?\[\/\1\]/gi, (full, tag) => {
    if (/^caption$/i.test(tag)) {
      const inner = full.replace(/^\[caption[^\]]*\]/i, "").replace(/\[\/caption\]$/i, "");
      return inner.trim();
    }
    return "";
  });
  out = out.replace(/\[\/?\w+[^\]]*\]/gi, "");
  return out;
}

function collapseEmpties(html: string): string {
  let out = html;
  out = out.replace(/<p[^>]*>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, "");
  out = out.replace(/(?:<br\s*\/?>\s*){3,}/gi, "<br/>");
  out = out.replace(/\n{3,}/g, "\n\n");
  return out.trim();
}

/** Replace em-dash (U+2014) and en-dash (U+2013) + their HTML entities with ASCII hyphen. */
export function normalizeDashes(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .replace(/—/g, "-").replace(/–/g, "-")
    .replace(/&mdash;/gi, "-").replace(/&ndash;/gi, "-")
    .replace(/&#8212;/g, "-").replace(/&#8211;/g, "-");
}

export function sanitizePostHtml(input: string | null | undefined): string {
  if (!input) return "";
  let html = input;
 html = html.replace(new RegExp("<!" + "--\\[if[\\s\\S]*?\\[endif\\]--" + ">", "gi"), "");
 html = html.replace(new RegExp("<!" + "--[\\s\\S]*?--" + ">", "g"), "");
  html = stripTagBlock(html, "script");
  html = stripTagBlock(html, "style");
  html = stripTagBlock(html, "audio");
  html = html.replace(/<a\b[^>]*href="[^"]*\.(?:mp3|wav|m4a|ogg)"[^>]*>[\s\S]*?<\/a>/gi, "");
  html = html.replace(/^\s*https?:\/\/\S+\.(?:mp3|wav|m4a|ogg)\s*/i, "");
  html = unwrapChatGptDivs(html);
  html = stripShortcodes(html);
  html = collapseEmpties(html);
  html = normalizeDashes(html);
  return html;
}

export function hasGarbage(input: string | null | undefined): boolean {
  if (!input) return false;
  return (
    /<!--\[if/i.test(input) || /<audio\b/i.test(input) || /<script\b/i.test(input) ||
    CHATGPT_ATTR_RE.test(input) || CHATGPT_CLASS_RE.test(input) ||
    /\[(caption|audio|playlist|gallery|embed)\b/i.test(input)
  );
}
