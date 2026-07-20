export function toYouTubeEmbed(url: string | null | undefined): string | null {
  if (!url) return null;
  const clean = url.replace(/\\\//g, "/").trim();
  // Match watch?v=, youtu.be/, shorts/, embed/
  const patterns = [
    /(?:youtube\.com\/watch\?[^#]*v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{6,})/i,
  ];
  for (const re of patterns) {
    const m = clean.match(re);
    if (m) return `https://www.youtube.com/embed/${m[1]}`;
  }
  return null;
}

export function youTubeThumb(url: string | null | undefined): string | null {
  const embed = toYouTubeEmbed(url);
  if (!embed) return null;
  const id = embed.split("/embed/")[1];
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}
