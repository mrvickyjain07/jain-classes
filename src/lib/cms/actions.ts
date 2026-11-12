"use server";

import { randomUUID } from "node:crypto";
import { updateTag } from "next/cache";
import type { z } from "zod";
import { isAdmin } from "@/lib/auth";
import { defaultFileType, parseDriveUrl } from "@/lib/google-drive";
import { slugify } from "@/lib/utils";
import {
  courseSchema, currentAffairSchema, fieldErrors, materialSchema, settingsSchema, subjectSchema, topicSchema,
} from "@/lib/validation";
import type { ActionResult, EntityKey } from "@/types/cms";
import { CMS_TAG, getAdminData } from "./data";
import { CmsError, type Row, type TabName } from "./schema";
import * as store from "./store";

/**
 * Every content change goes through this file. Each action re-checks the
 * administrator session on the server before touching Google Sheets.
 */

const ENTITY: Record<EntityKey, { tab: TabName; prefix: string; label: string }> = {
  courses: { tab: "Courses", prefix: "crs", label: "Course" },
  subjects: { tab: "Subjects", prefix: "sub", label: "Subject" },
  topics: { tab: "Topics", prefix: "top", label: "Topic" },
  materials: { tab: "Materials", prefix: "mat", label: "Study material" },
  "current-affairs": { tab: "CurrentAffairs", prefix: "ca", label: "Article" },
};

const UNAUTHORISED: ActionResult = { ok: false, error: "Your session has expired. Please log in again." };
const bool = (v: boolean) => (v ? "TRUE" : "FALSE");

function failure(error: unknown): ActionResult {
  if (error instanceof CmsError) return { ok: false, error: error.message };
  console.error("[admin action]", error);
  return { ok: false, error: "Something went wrong while saving. Please try again." };
}

function invalid(error: z.ZodError): ActionResult {
  return { ok: false, error: "Please correct the highlighted fields.", fieldErrors: fieldErrors(error) };
}

type Admin = Awaited<ReturnType<typeof getAdminData>>;

function newId(prefix: string, existing: { id: string }[]): string {
  const used = new Set(existing.map((e) => e.id));
  for (;;) {
    const id = `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 10)}`;
    if (!used.has(id)) return id;
  }
}

// Titles written only in Marathi cannot be turned into a Latin slug automatically.
const fallbackSlug = (kind: string) => `${kind}-${Date.now().toString(36)}`;

/** Builds the sheet row for an entity, or returns a validation failure. */
function buildRow(entity: EntityKey, input: unknown, data: Admin): { row: Row; id?: string } | ActionResult {
  const dup = (field: string, message: string): ActionResult => ({
    ok: false, error: "Please correct the highlighted fields.", fieldErrors: { [field]: message },
  });

  switch (entity) {
    case "courses": {
      const p = courseSchema.safeParse(input);
      if (!p.success) return invalid(p.error);
      const slug = p.data.slug || slugify(p.data.title) || fallbackSlug("course");
      if (data.courses.some((c) => c.slug === slug && c.id !== p.data.id)) return dup("slug", "Another course already uses this web address.");
      return { id: p.data.id, row: { title: p.data.title, slug, description: p.data.description, category: p.data.category, image: p.data.image, display_order: String(p.data.display_order), published: bool(p.data.published) } };
    }
    case "subjects": {
      const p = subjectSchema.safeParse(input);
      if (!p.success) return invalid(p.error);
      if (!data.courses.some((c) => c.id === p.data.course_id)) return dup("course_id", "Choose an existing course.");
      const slug = p.data.slug || slugify(p.data.title) || fallbackSlug("subject");
      if (data.subjects.some((s) => s.slug === slug && s.course_id === p.data.course_id && s.id !== p.data.id)) return dup("slug", "This course already has a subject with this web address.");
      return { id: p.data.id, row: { course_id: p.data.course_id, title: p.data.title, slug, description: p.data.description, display_order: String(p.data.display_order), published: bool(p.data.published) } };
    }
    case "topics": {
      const p = topicSchema.safeParse(input);
      if (!p.success) return invalid(p.error);
      if (!data.subjects.some((s) => s.id === p.data.subject_id)) return dup("subject_id", "Choose an existing subject.");
      const slug = p.data.slug || slugify(p.data.title) || fallbackSlug("topic");
      if (data.topics.some((t) => t.slug === slug && t.subject_id === p.data.subject_id && t.id !== p.data.id)) return dup("slug", "This subject already has a topic with this web address.");
      return { id: p.data.id, row: { subject_id: p.data.subject_id, title: p.data.title, slug, description: p.data.description, display_order: String(p.data.display_order), published: bool(p.data.published) } };
    }
    case "materials": {
      const p = materialSchema.safeParse(input);
      if (!p.success) return invalid(p.error);
      if (!data.topics.some((t) => t.id === p.data.topic_id)) return dup("topic_id", "Choose an existing topic.");
      const link = parseDriveUrl(p.data.google_drive_url);
      if (!link) return dup("google_drive_url", "This is not a valid Google Drive link.");
      const fileType = link.kind === "file" ? p.data.file_type : defaultFileType(link.kind);
      return { id: p.data.id, row: { topic_id: p.data.topic_id, title: p.data.title, description: p.data.description, google_drive_url: p.data.google_drive_url, google_drive_file_id: link.id, file_type: fileType, display_order: String(p.data.display_order), published: bool(p.data.published), featured: bool(p.data.featured) } };
    }
    case "current-affairs": {
      const p = currentAffairSchema.safeParse(input);
      if (!p.success) return invalid(p.error);
      const slug = p.data.slug || slugify(p.data.title) || fallbackSlug("article");
      if (data.currentAffairs.some((a) => a.slug === slug && a.id !== p.data.id)) return dup("slug", "Another article already uses this web address.");
      const publishedAt = p.data.published_at
        ? new Date(p.data.published_at).toISOString()
        : p.data.published ? new Date().toISOString() : "";
      return { id: p.data.id, row: { title: p.data.title, slug, summary: p.data.summary, content: p.data.content, category: p.data.category, source_urls: p.data.source_urls, relevant_exam: p.data.relevant_exam, published: bool(p.data.published), published_at: publishedAt } };
    }
  }
}

function collection(entity: EntityKey, data: Admin): { id: string }[] {
  return entity === "current-affairs" ? data.currentAffairs : data[entity];
}

export async function saveRecord(entity: EntityKey, input: unknown): Promise<ActionResult> {
  if (!(await isAdmin())) return UNAUTHORISED;
  const meta = ENTITY[entity];
  if (!meta) return { ok: false, error: "Unknown content type." };
  try {
    const data = await getAdminData();
    const built = buildRow(entity, input, data);
    if ("ok" in built) return built;
    const now = new Date().toISOString();
    const items = collection(entity, data);
    if (built.id) {
      if (!items.some((i) => i.id === built.id)) return { ok: false, error: "That record no longer exists. Refresh the page." };
      await store.updateRow(meta.tab, "id", built.id, { ...built.row, updated_at: now });
    } else {
      await store.insertRow(meta.tab, { id: newId(meta.prefix, items), ...built.row, created_at: now, updated_at: now });
    }
    updateTag(CMS_TAG);
    return { ok: true, message: `${meta.label} ${built.id ? "updated" : "added"}.` };
  } catch (error) {
    return failure(error);
  }
}

export async function setPublished(entity: EntityKey, id: string, published: boolean): Promise<ActionResult> {
  if (!(await isAdmin())) return UNAUTHORISED;
  const meta = ENTITY[entity];
  if (!meta || typeof id !== "string" || typeof published !== "boolean") return { ok: false, error: "Invalid request." };
  try {
    const now = new Date().toISOString();
    const patch: Row = { published: bool(published), updated_at: now };
    if (entity === "current-affairs" && published) {
      const data = await getAdminData();
      const article = data.currentAffairs.find((a) => a.id === id);
      if (article && !article.published_at) patch.published_at = now;
    }
    await store.updateRow(meta.tab, "id", id, patch);
    updateTag(CMS_TAG);
    return { ok: true, message: published ? `${meta.label} published.` : `${meta.label} unpublished and hidden from the website.` };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteRecord(entity: EntityKey, id: string): Promise<ActionResult> {
  if (!(await isAdmin())) return UNAUTHORISED;
  const meta = ENTITY[entity];
  if (!meta || typeof id !== "string") return { ok: false, error: "Invalid request." };
  try {
    const data = await getAdminData();
    // Children must be removed first, so nothing is left orphaned in the spreadsheet.
    if (entity === "courses" && data.subjects.some((s) => s.course_id === id)) {
      return { ok: false, error: "This course still has subjects. Delete or move them first, or simply unpublish the course to hide it." };
    }
    if (entity === "subjects" && data.topics.some((t) => t.subject_id === id)) {
      return { ok: false, error: "This subject still has topics. Delete or move them first, or unpublish the subject to hide it." };
    }
    if (entity === "topics" && data.materials.some((m) => m.topic_id === id)) {
      return { ok: false, error: "This topic still has study materials. Delete or move them first, or unpublish the topic to hide it." };
    }
    await store.deleteRow(meta.tab, "id", id);
    updateTag(CMS_TAG);
    return { ok: true, message: `${meta.label} deleted.` };
  } catch (error) {
    return failure(error);
  }
}

export async function saveSettings(input: unknown): Promise<ActionResult> {
  if (!(await isAdmin())) return UNAUTHORISED;
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  try {
    const current = (await store.readAll()).Settings;
    const now = new Date().toISOString();
    let changed = 0;
    for (const [key, value] of Object.entries(parsed.data)) {
      const existing = current.find((r) => r.setting_key === key);
      if (existing && (existing.setting_value ?? "") === value) continue;
      if (existing) await store.updateRow("Settings", "setting_key", key, { setting_value: value, updated_at: now });
      else await store.insertRow("Settings", { setting_key: key, setting_value: value, updated_at: now });
      changed++;
    }
    updateTag(CMS_TAG);
    return { ok: true, message: changed ? `Settings saved (${changed} updated).` : "No changes to save." };
  } catch (error) {
    return failure(error);
  }
}

export async function setupSpreadsheet(withStarterContent: boolean): Promise<ActionResult> {
  if (!(await isAdmin())) return UNAUTHORISED;
  try {
    const log = await store.setup(withStarterContent === true);
    updateTag(CMS_TAG);
    return { ok: true, message: log.join(" · ") };
  } catch (error) {
    return failure(error);
  }
}
