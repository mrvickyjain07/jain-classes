import type { Metadata } from "next";
import { CourseCard } from "@/components/courses/course-card";
import { CtaBand } from "@/components/home/sections";
import { EmptyState, PageHero } from "@/components/shared/section";
import { WhatsAppLink } from "@/components/shared/whatsapp";
import { getSiteContent } from "@/lib/cms/data";
import { contextualMessage } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Courses",
  description: "Courses at Jain Classes: UPSC Civil Services, MPSC Rajyaseva, MPSC Group B, MPSC Group C and other Maharashtra competitive examinations.",
  alternates: { canonical: "/courses" },
};

export default async function CoursesPage() {
  const { settings, courses } = await getSiteContent();
  const categories = Array.from(new Set(courses.map((c) => c.category)));
  return (
    <>
      <PageHero eyebrow="Courses" title="Courses for UPSC, MPSC and competitive examinations" description="Select a course to see its subjects, topics and free study materials." />
      <section className="section-y">
        <div className="container-page space-y-14">
          {categories.map((category) => (
            <div key={category}>
              <h2 className="text-2xl font-semibold md:text-3xl">{category}</h2>
              <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {courses.filter((c) => c.category === category).map((c) => (
                  <CourseCard key={c.id} course={c} whatsapp={settings.whatsapp_number} institute={settings.institute_name} />
                ))}
              </div>
            </div>
          ))}
          {courses.length === 0 ? <EmptyState title="Courses will be listed here soon">Please contact us on WhatsApp for current course information.</EmptyState> : null}
        </div>
      </section>
      <CtaBand title="Not sure which course suits you?" text="Tell us about your goal and we will guide you.">
        <WhatsAppLink number={settings.whatsapp_number} message={contextualMessage({ type: "guidance" }, settings.institute_name)} variant="primary" size="lg" />
      </CtaBand>
    </>
  );
}
