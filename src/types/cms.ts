export type Course = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  image: string;
  display_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type Subject = {
  id: string;
  course_id: string;
  title: string;
  slug: string;
  description: string;
  display_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type Topic = {
  id: string;
  subject_id: string;
  title: string;
  slug: string;
  description: string;
  display_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type Material = {
  id: string;
  topic_id: string;
  title: string;
  description: string;
  google_drive_url: string;
  google_drive_file_id: string;
  file_type: string;
  display_order: number;
  published: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
};

export type CurrentAffair = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  source_urls: string;
  relevant_exam: string;
  published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
};

export type CmsData = {
  courses: Course[];
  subjects: Subject[];
  topics: Topic[];
  materials: Material[];
  currentAffairs: CurrentAffair[];
  settings: Record<string, string>;
};

export type EntityKey =
  | "courses"
  | "subjects"
  | "topics"
  | "materials"
  | "current-affairs";

/** Published content shaped for the public website. */
export type PublicMaterial = Material & {
  links: { open: string; preview: string | null; download: string | null };
  kind: string;
  topicTitle: string;
  topicSlug: string;
  subjectTitle: string;
  subjectSlug: string;
  courseTitle: string;
  courseSlug: string;
  category: string;
};
export type PublicTopic = Topic & { materials: PublicMaterial[] };
export type PublicSubject = Subject & { topics: PublicTopic[]; materialCount: number };
export type PublicCourse = Course & { subjects: PublicSubject[]; materialCount: number };

export type SiteContent = {
  settings: Settings;
  courses: PublicCourse[];
  materials: PublicMaterial[];
  currentAffairs: CurrentAffair[];
};

export type Settings = Record<string, string>;

export type ActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };
