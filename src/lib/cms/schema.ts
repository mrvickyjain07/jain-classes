/** Worksheet layout of the "Jain Classes CMS" Google Spreadsheet. */

export const TABS = {
  Courses: ["id", "title", "slug", "description", "category", "image", "display_order", "published", "created_at", "updated_at"],
  Subjects: ["id", "course_id", "title", "slug", "description", "display_order", "published", "created_at", "updated_at"],
  Topics: ["id", "subject_id", "title", "slug", "description", "display_order", "published", "created_at", "updated_at"],
  Materials: ["id", "topic_id", "title", "description", "google_drive_url", "google_drive_file_id", "file_type", "display_order", "published", "featured", "created_at", "updated_at"],
  CurrentAffairs: ["id", "title", "slug", "summary", "content", "category", "source_urls", "relevant_exam", "published", "published_at", "created_at", "updated_at"],
  Settings: ["setting_key", "setting_value", "updated_at"],
} as const;

export type TabName = keyof typeof TABS;
export const TAB_NAMES = Object.keys(TABS) as TabName[];

export type Row = Record<string, string>;
export type RawTables = Record<TabName, Row[]>;

export const EXAM_CATEGORIES = ["UPSC", "MPSC", "Other Competitive Exams"] as const;

export const CURRENT_AFFAIRS_CATEGORIES = [
  "Daily Current Affairs",
  "National News",
  "Maharashtra News",
  "Government Schemes",
  "Economy",
  "Science and Technology",
  "International Affairs",
] as const;

export class CmsError extends Error {
  code: "not_configured" | "auth" | "quota" | "not_found" | "api" | "conflict";
  constructor(code: CmsError["code"], message: string) {
    super(message);
    this.name = "CmsError";
    this.code = code;
  }
}
