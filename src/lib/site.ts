export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  if (explicit) return explicit;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/courses", label: "Courses" },
  { href: "/study-materials", label: "Study Materials" },
  { href: "/current-affairs", label: "Current Affairs" },
  { href: "/contact", label: "Contact Us" },
] as const;

export function socialLinks(settings: Record<string, string>) {
  return [
    { key: "social_youtube", label: "YouTube" },
    { key: "social_telegram", label: "Telegram" },
    { key: "social_instagram", label: "Instagram" },
    { key: "social_facebook", label: "Facebook" },
    { key: "social_x", label: "X (Twitter)" },
  ]
    .map((s) => ({ label: s.label, href: settings[s.key] ?? "" }))
    .filter((s) => /^https:\/\//.test(s.href));
}

/** Only site-relative image paths are rendered, with the bundled asset as fallback. */
export function imagePath(value: string | undefined, fallback: string): string {
  return value && /^\/[\w\-./]+$/.test(value) ? value : fallback;
}
