import type { MetadataRoute } from "next";
import { getSiteContent } from "@/lib/cms/data";
import { siteUrl } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const { courses, currentAffairs } = await getSiteContent();
  const page = (path: string, priority: number, lastModified?: string): MetadataRoute.Sitemap[number] => ({
    url: `${base}${path}`,
    priority,
    changeFrequency: "weekly",
    ...(lastModified && !Number.isNaN(Date.parse(lastModified)) ? { lastModified: new Date(lastModified) } : {}),
  });
  return [
    page("", 1),
    page("/about", 0.7),
    page("/courses", 0.9),
    page("/study-materials", 0.9),
    page("/current-affairs", 0.8),
    page("/contact", 0.6),
    page("/privacy-policy", 0.2),
    page("/terms-and-conditions", 0.2),
    ...courses.map((c) => page(`/courses/${c.slug}`, 0.8, c.updated_at)),
    ...currentAffairs.map((a) => page(`/current-affairs/${a.slug}`, 0.6, a.updated_at || a.published_at)),
  ];
}
