import type { RawTables, Row } from "./schema";

/**
 * Starter content. Used to pre-fill a new spreadsheet and as the fallback
 * when Google Sheets is not configured yet. It deliberately contains no
 * study-material links, current affairs, fees, results or credentials:
 * those are added by the administrator.
 */

const NOW = "2026-01-01T00:00:00.000Z";

export const DEFAULT_SETTINGS: Record<string, string> = {
  institute_name: "Jain Classes",
  professor_name: "Prof. Madhusudan Jain",
  phone: "7558536630",
  whatsapp_number: "917558536630",
  email: "jainclasses.official@gmail.com",
  tagline: "ज्ञान • दिशा • यश",
  location: "Maharashtra, India",
  logo_path: "/images/jain-classes-logo.png",
  professor_image_path: "/images/prof-madhusudan-jain.jpg",
  hero_headline: "Your Journey Towards Success Starts Here.",
  hero_subtitle: "UPSC | MPSC | Competitive Examinations",
  hero_description:
    "Prepare with conceptual clarity, structured learning, regular practice and quality study resources at Jain Classes.",
  home_intro:
    "Jain Classes supports students preparing for UPSC, MPSC and other Maharashtra competitive examinations. Our focus is on building strong concepts, studying in a structured way and practising regularly.\n\nEvery study resource on this website is free and open to all students. No registration or login is needed.",
  about_intro:
    "Jain Classes is an educational institute for aspirants of UPSC, MPSC and other Maharashtra competitive examinations. We believe that good preparation starts with clear concepts, a structured plan and access to reliable study resources.",
  vision:
    "To make quality guidance and study resources for competitive examinations accessible to every sincere student.",
  mission:
    "To help aspirants build conceptual clarity, follow an exam-oriented study plan and practise consistently, with study materials that remain free for everyone.",
  teaching_philosophy:
    "Understand the concept first, then connect it to the examination. We encourage students to learn the why behind every topic, revise regularly and test themselves with previous-year questions.",
  educational_approach:
    "Subject-wise notes, topic-wise organisation, current affairs and previous-year questions come together in one structured learning path, in Marathi and English.",
  professor_intro:
    "Prof. Madhusudan Jain guides students preparing for UPSC, MPSC and other competitive examinations at Jain Classes.",
  professor_guidance:
    "His guidance focuses on conceptual understanding, a disciplined study routine and steady practice, so that students can prepare with confidence.",
  social_facebook: "",
  social_instagram: "",
  social_youtube: "",
  social_telegram: "",
  social_x: "",
  seo_title: "Jain Classes | UPSC, MPSC and Competitive Examination Guidance",
  seo_description:
    "Jain Classes offers guidance and free study materials for UPSC, MPSC Rajyaseva, MPSC Group B, MPSC Group C and other Maharashtra competitive examinations.",
};

const course = (id: string, title: string, slug: string, category: string, order: number, description: string): Row => ({
  id, title, slug, description, category, image: "", display_order: String(order), published: "TRUE", created_at: NOW, updated_at: NOW,
});

const subject = (id: string, course_id: string, title: string, slug: string, order: number): Row => ({
  id, course_id, title, slug, description: "", display_order: String(order), published: "TRUE", created_at: NOW, updated_at: NOW,
});

const topic = (id: string, subject_id: string, title: string, slug: string, order: number): Row => ({
  id, subject_id, title, slug, description: "", display_order: String(order), published: "TRUE", created_at: NOW, updated_at: NOW,
});

export const SEED: RawTables = {
  Courses: [
    course("crs_upsc", "UPSC Civil Services", "upsc", "UPSC", 1,
      "Guidance and study resources for the UPSC Civil Services Examination, covering the General Studies subjects with a focus on conceptual clarity."),
    course("crs_rajyaseva", "MPSC Rajyaseva", "mpsc-rajyaseva", "MPSC", 2,
      "Preparation support for the MPSC Rajyaseva (State Services) Examination with subject-wise notes and Maharashtra-specific content."),
    course("crs_groupb", "MPSC Group B", "mpsc-group-b", "MPSC", 3,
      "Study resources for the MPSC Group B (Combined) examinations, organised subject-wise and topic-wise."),
    course("crs_groupc", "MPSC Group C", "mpsc-group-c", "MPSC", 4,
      "Study resources for the MPSC Group C (Combined) examinations, with emphasis on fundamentals and regular practice."),
    course("crs_other", "Other Competitive Exams", "other-competitive-exams", "Other Competitive Exams", 5,
      "Support for other Maharashtra competitive examinations with general studies, Maharashtra GK and current affairs resources."),
  ],
  Subjects: [
    subject("sub_upsc_polity", "crs_upsc", "Indian Polity", "indian-polity", 1),
    subject("sub_upsc_history", "crs_upsc", "Indian History", "indian-history", 2),
    subject("sub_upsc_geo", "crs_upsc", "Geography", "geography", 3),
    subject("sub_upsc_eco", "crs_upsc", "Indian Economy", "indian-economy", 4),
    subject("sub_rs_polity", "crs_rajyaseva", "Indian Polity", "indian-polity", 1),
    subject("sub_rs_history", "crs_rajyaseva", "Indian History", "indian-history", 2),
    subject("sub_rs_geo", "crs_rajyaseva", "Geography", "geography", 3),
    subject("sub_rs_eco", "crs_rajyaseva", "Indian Economy", "indian-economy", 4),
    subject("sub_rs_mhgk", "crs_rajyaseva", "Maharashtra GK", "maharashtra-gk", 5),
    subject("sub_rs_sci", "crs_rajyaseva", "General Science", "general-science", 6),
    subject("sub_gb_polity", "crs_groupb", "Indian Polity", "indian-polity", 1),
    subject("sub_gb_mhgk", "crs_groupb", "Maharashtra GK", "maharashtra-gk", 2),
    subject("sub_gb_sci", "crs_groupb", "General Science", "general-science", 3),
    subject("sub_gc_mhgk", "crs_groupc", "Maharashtra GK", "maharashtra-gk", 1),
    subject("sub_gc_sci", "crs_groupc", "General Science", "general-science", 2),
    subject("sub_ot_mhgk", "crs_other", "Maharashtra GK", "maharashtra-gk", 1),
    subject("sub_ot_ca", "crs_other", "Current Affairs", "current-affairs", 2),
  ],
  Topics: [
    topic("top_rs_pol_1", "sub_rs_polity", "Historical Background", "historical-background", 1),
    topic("top_rs_pol_2", "sub_rs_polity", "Fundamental Rights", "fundamental-rights", 2),
    topic("top_rs_pol_3", "sub_rs_polity", "Directive Principles", "directive-principles", 3),
    topic("top_rs_pol_4", "sub_rs_polity", "Fundamental Duties", "fundamental-duties", 4),
    topic("top_rs_pol_5", "sub_rs_polity", "Parliament", "parliament", 5),
    topic("top_rs_pol_6", "sub_rs_polity", "President of India", "president-of-india", 6),
  ],
  Materials: [],
  CurrentAffairs: [],
  Settings: Object.entries(DEFAULT_SETTINGS).map(([setting_key, setting_value]) => ({
    setting_key,
    setting_value,
    updated_at: NOW,
  })),
};
