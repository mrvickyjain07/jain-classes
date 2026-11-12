import "server-only";
import { unstable_cache } from "next/cache";
import { parseDriveUrl } from "@/lib/google-drive";
import type {
  CmsData, Course, CurrentAffair, Material, PublicCourse, PublicMaterial, PublicSubject, PublicTopic, SiteContent, Subject, Topic,
} from "@/types/cms";
import type { RawTables, Row } from "./schema";
import { DEFAULT_SETTINGS } from "./seed";
import { readAll } from "./store";

export const CMS_TAG = "cms";
/** Public pages re-check Google Sheets at most this often (seconds). */
export const PUBLIC_REVALIDATE_SECONDS = 300;

const bool = (v: string | undefined) => /^(true|yes|y|1)$/i.test((v ?? "").trim());
const num = (v: string | undefined) => {
  const n = Number((v ?? "").trim());
  return Number.isFinite(n) ? n : 0;
};
const str = (v: string | undefined) => (v ?? "").trim();

/** Keeps the first record for each id and drops rows without one. */
function unique<T extends { id: string }>(items: T[], label: string, issues: string[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    if (!item.id) continue;
    if (seen.has(item.id)) {
      issues.push(`${label}: duplicate id "${item.id}" (only the first row is used).`);
      continue;
    }
    seen.add(item.id);
    out.push(item);
  }
  return out;
}

const byOrder = <T extends { display_order: number; title: string }>(a: T, b: T) =>
  a.display_order - b.display_order || a.title.localeCompare(b.title);

export function parseTables(raw: RawTables): CmsData & { issues: string[] } {
  const issues: string[] = [];
  const base = (r: Row) => ({
    id: str(r.id),
    title: str(r.title),
    slug: str(r.slug),
    description: str(r.description),
    display_order: num(r.display_order),
    published: bool(r.published),
    created_at: str(r.created_at),
    updated_at: str(r.updated_at),
  });

  const courses: Course[] = unique(
    raw.Courses.map((r) => ({ ...base(r), category: str(r.category), image: str(r.image) })),
    "Courses", issues,
  ).sort(byOrder);
  const subjects: Subject[] = unique(
    raw.Subjects.map((r) => ({ ...base(r), course_id: str(r.course_id) })),
    "Subjects", issues,
  ).sort(byOrder);
  const topics: Topic[] = unique(
    raw.Topics.map((r) => ({ ...base(r), subject_id: str(r.subject_id) })),
    "Topics", issues,
  ).sort(byOrder);
  const materials: Material[] = unique(
    raw.Materials.map((r) => {
      const { slug: _slug, ...rest } = base(r);
      void _slug;
      return {
        ...rest,
        topic_id: str(r.topic_id),
        google_drive_url: str(r.google_drive_url),
        google_drive_file_id: str(r.google_drive_file_id),
        file_type: str(r.file_type) || "PDF",
        featured: bool(r.featured),
      };
    }),
    "Materials", issues,
  ).sort(byOrder);
  const currentAffairs: CurrentAffair[] = unique(
    raw.CurrentAffairs.map((r) => {
      const { description: _d, display_order: _o, ...rest } = base(r);
      void _d; void _o;
      return {
        ...rest,
        summary: str(r.summary),
        content: (r.content ?? "").trim(),
        category: str(r.category),
        source_urls: str(r.source_urls),
        relevant_exam: str(r.relevant_exam),
        published_at: str(r.published_at),
      };
    }),
    "CurrentAffairs", issues,
  ).sort((a, b) => (b.published_at || b.created_at).localeCompare(a.published_at || a.created_at));

  const settings: Record<string, string> = { ...DEFAULT_SETTINGS };
  for (const r of raw.Settings) {
    const key = str(r.setting_key);
    if (key) settings[key] = (r.setting_value ?? "").trim();
  }

  for (const m of materials) {
    if (!parseDriveUrl(m.google_drive_url)) {
      issues.push(`Materials: "${m.title || m.id}" has an invalid Google Drive link and is hidden from the website.`);
    }
  }

  return { courses, subjects, topics, materials, currentAffairs, settings, issues };
}

/** Builds the published tree. Unpublishing a parent hides everything beneath it. */
export function toSiteContent(data: CmsData): SiteContent {
  const allMaterials: PublicMaterial[] = [];
  const courses: PublicCourse[] = data.courses
    .filter((c) => c.published)
    .map((course) => {
      const subjects: PublicSubject[] = data.subjects
        .filter((s) => s.published && s.course_id === course.id)
        .map((subject) => {
          const topics: PublicTopic[] = data.topics
            .filter((t) => t.published && t.subject_id === subject.id)
            .map((topic) => {
              const materials: PublicMaterial[] = [];
              for (const m of data.materials) {
                if (!m.published || m.topic_id !== topic.id) continue;
                const link = parseDriveUrl(m.google_drive_url);
                if (!link) continue;
                materials.push({
                  ...m,
                  kind: link.kind,
                  links: { open: link.open, preview: link.preview, download: link.download },
                  topicTitle: topic.title,
                  topicSlug: topic.slug,
                  subjectTitle: subject.title,
                  subjectSlug: subject.slug,
                  courseTitle: course.title,
                  courseSlug: course.slug,
                  category: course.category,
                });
              }
              allMaterials.push(...materials);
              return { ...topic, materials };
            });
          return { ...subject, topics, materialCount: topics.reduce((n, t) => n + t.materials.length, 0) };
        });
      return { ...course, subjects, materialCount: subjects.reduce((n, s) => n + s.materialCount, 0) };
    });

  const materials = [...allMaterials].sort((a, b) =>
    (b.created_at || b.updated_at).localeCompare(a.created_at || a.updated_at),
  );
  return {
    settings: data.settings,
    courses,
    materials,
    currentAffairs: data.currentAffairs.filter((a) => a.published && a.slug),
  };
}

const cachedTables = unstable_cache(async () => readAll(), ["cms-all-tabs"], {
  tags: [CMS_TAG],
  revalidate: PUBLIC_REVALIDATE_SECONDS,
});

/**
 * Published content for the public website (cached, revalidated after admin edits).
 * At runtime a Google outage throws, so Next.js keeps serving the last good page.
 * During the build we fall back to empty content instead of failing the deployment.
 */
export async function getSiteContent(): Promise<SiteContent> {
  try {
    return toSiteContent(parseTables(await cachedTables()));
  } catch (error) {
    if (process.env.NEXT_PHASE === "phase-production-build") {
      console.error("[cms] content unavailable during build:", (error as Error).message);
      return { settings: { ...DEFAULT_SETTINGS }, courses: [], materials: [], currentAffairs: [] };
    }
    throw error;
  }
}

/** Everything, including unpublished records. Admin only; never cached. */
export async function getAdminData() {
  return parseTables(await readAll());
}
