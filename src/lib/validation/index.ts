import { z } from "zod";
import { CURRENT_AFFAIRS_CATEGORIES } from "@/lib/cms/schema";
import { FILE_TYPES, parseDriveUrl } from "@/lib/google-drive";

const text = (max: number) => z.string().trim().max(max, `Keep this under ${max} characters.`);
const title = z.string().trim().min(2, "Enter a title.").max(160, "Keep the title under 160 characters.");
const slug = z
  .string()
  .trim()
  .max(80)
  .regex(/^$|^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only.");
const order = z.coerce.number().int("Use a whole number.").min(0).max(9999).default(0);
const id = z.string().trim().max(60).optional();
const published = z.boolean().default(false);

export const courseSchema = z.object({
  id,
  title,
  slug,
  description: text(4000),
  category: z.string().trim().min(2, "Choose an examination category.").max(60),
  image: z
    .string()
    .trim()
    .max(300)
    .regex(/^$|^\/[\w\-./]+$|^https:\/\/[^\s]+$/, "Use a path such as /images/photo.jpg or an https:// link."),
  display_order: order,
  published,
});

export const subjectSchema = z.object({
  id,
  course_id: z.string().trim().min(1, "Choose a course."),
  title,
  slug,
  description: text(2000),
  display_order: order,
  published,
});

export const topicSchema = z.object({
  id,
  subject_id: z.string().trim().min(1, "Choose a subject."),
  title,
  slug,
  description: text(2000),
  display_order: order,
  published,
});

export const materialSchema = z.object({
  id,
  topic_id: z.string().trim().min(1, "Choose a topic."),
  title,
  description: text(1000),
  google_drive_url: z
    .string()
    .trim()
    .min(1, "Paste the Google Drive sharing link.")
    .refine((v) => parseDriveUrl(v) !== null, "This is not a valid Google Drive link. Copy the link from Drive using Share > Copy link."),
  file_type: z.enum(FILE_TYPES).default("PDF"),
  display_order: order,
  published,
  featured: z.boolean().default(false),
});

const httpUrl = z.string().refine((v) => {
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
});

export const currentAffairSchema = z.object({
  id,
  title,
  slug,
  summary: z.string().trim().min(10, "Write a short summary.").max(600, "Keep the summary under 600 characters."),
  content: z.string().trim().min(20, "Write the article content.").max(30000),
  category: z.enum(CURRENT_AFFAIRS_CATEGORIES, { message: "Choose a category." }),
  source_urls: z
    .string()
    .trim()
    .max(2000)
    .refine(
      (v) => v.split(/\r?\n/).map((s) => s.trim()).filter(Boolean).every((u) => httpUrl.safeParse(u).success),
      "Enter one full link per line, starting with https://",
    ),
  relevant_exam: text(120),
  published,
  published_at: z
    .string()
    .trim()
    .regex(/^$|^\d{4}-\d{2}-\d{2}/, "Choose a date."),
});

const social = z
  .string()
  .trim()
  .max(300)
  .regex(/^$|^https:\/\/[^\s]+$/, "Enter the full link starting with https://");

export const settingsSchema = z.object({
  institute_name: z.string().trim().min(2).max(80),
  professor_name: z.string().trim().min(2).max(80),
  phone: z.string().trim().regex(/^(\+91[\s-]?)?[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number."),
  whatsapp_number: z
    .string()
    .trim()
    .regex(/^\+?\d[\d\s-]{9,16}$/, "Enter the WhatsApp number with country code, e.g. 917558536630."),
  email: z.email("Enter a valid email address.").max(120),
  tagline: text(120),
  location: text(200),
  logo_path: z.string().trim().regex(/^\/[\w\-./]+$/, "Use a path such as /images/jain-classes-logo.png").max(200),
  professor_image_path: z.string().trim().regex(/^\/[\w\-./]+$/, "Use a path such as /images/prof-madhusudan-jain.jpg").max(200),
  hero_headline: z.string().trim().min(5).max(120),
  hero_subtitle: text(120),
  hero_description: text(400),
  home_intro: text(3000),
  about_intro: text(3000),
  vision: text(1500),
  mission: text(1500),
  teaching_philosophy: text(2000),
  educational_approach: text(2000),
  professor_intro: text(2000),
  professor_guidance: text(2000),
  social_facebook: social,
  social_instagram: social,
  social_youtube: social,
  social_telegram: social,
  social_x: social,
  seo_title: text(70),
  seo_description: text(200),
});

export const loginSchema = z.object({
  email: z.email().max(200),
  password: z.string().min(1).max(200),
});

export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(80, "Name is too long."),
  mobile: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s-]/g, "").replace(/^(\+91|91|0)(?=[6-9]\d{9}$)/, ""))
    .refine((v) => /^[6-9]\d{9}$/.test(v), "Enter a valid 10-digit Indian mobile number."),
  exam: z.string().trim().min(1, "Please choose an examination.").max(80),
  course: z.string().trim().max(120),
  message: z.string().trim().max(500, "Keep your message under 500 characters."),
});

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}
