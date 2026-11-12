import { ArrowRight, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/home/sections";
import { EmptyState, RichText } from "@/components/shared/section";
import { WhatsAppLink } from "@/components/shared/whatsapp";
import { MaterialCard } from "@/components/study-materials/material-card";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/form";
import { getSiteContent } from "@/lib/cms/data";
import { contextualMessage } from "@/lib/whatsapp";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { courses } = await getSiteContent();
  return courses.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { courses, settings } = await getSiteContent();
  const course = courses.find((c) => c.slug === slug);
  if (!course) return { title: "Course not found" };
  return {
    title: `${course.title} Preparation`,
    description: course.description.slice(0, 155) || `${course.title} guidance and free study materials at ${settings.institute_name}.`,
    alternates: { canonical: `/courses/${course.slug}` },
  };
}

export default async function CoursePage({ params }: Props) {
  const { slug } = await params;
  const { courses, settings } = await getSiteContent();
  const course = courses.find((c) => c.slug === slug);
  if (!course) notFound();

  const materials = course.subjects.flatMap((s) => s.topics.flatMap((t) => t.materials))
    .sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 6);
  const message = contextualMessage({ type: "course", course: course.title }, settings.institute_name);

  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="container-page py-12 md:py-16">
          <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-sm text-muted">
            <Link href="/courses" className="hover:text-navy hover:underline">Courses</Link>
            <ChevronRight className="size-4" aria-hidden="true" />
            <span aria-current="page" className="font-semibold text-navy">{course.title}</span>
          </nav>
          <Badge tone="saffron">{course.category}</Badge>
          <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">{course.title}</h1>
          {course.description ? <RichText text={course.description} className="mt-5 max-w-3xl text-lg text-muted" /> : null}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <WhatsAppLink number={settings.whatsapp_number} message={message} size="lg">Enquire about this course</WhatsAppLink>
            <Link href={`/study-materials?course=${course.slug}`} className={buttonVariants({ variant: "outline", size: "lg" })}>
              Free study materials <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="section-y">
        <div className="container-page">
          <h2 className="text-3xl font-semibold">Subjects and topics</h2>
          {course.subjects.length > 0 ? (
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {course.subjects.map((s) => (
                <article key={s.id} className="rounded-xl border border-line bg-white p-6 shadow-card">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-xl font-semibold">{s.title}</h3>
                    {s.materialCount > 0 ? <Badge tone="success">{s.materialCount} free</Badge> : null}
                  </div>
                  {s.description ? <p className="mt-2 text-[0.95rem] text-muted">{s.description}</p> : null}
                  {s.topics.length > 0 ? (
                    <ul className="mt-4 space-y-1.5 text-[0.95rem]">
                      {s.topics.slice(0, 8).map((t) => (
                        <li key={t.id}>
                          <Link href={`/study-materials?course=${course.slug}&subject=${s.slug}&topic=${t.slug}`} className="flex items-center gap-2 text-ink hover:text-navy hover:underline">
                            <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-saffron" /> {t.title}
                          </Link>
                        </li>
                      ))}
                      {s.topics.length > 8 ? <li className="text-sm text-muted">and {s.topics.length - 8} more topics</li> : null}
                    </ul>
                  ) : (
                    <p className="mt-4 text-sm text-muted">Topics will be added soon.</p>
                  )}
                  <Link href={`/study-materials?course=${course.slug}&subject=${s.slug}`} className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-navy hover:underline">
                    Open {s.title} notes <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-8"><EmptyState title="Subjects will be added soon">Message us on WhatsApp for details about this course.</EmptyState></div>
          )}
        </div>
      </section>

      {materials.length > 0 ? (
        <section className="section-y border-t border-line bg-white">
          <div className="container-page">
            <h2 className="text-3xl font-semibold">Free study materials for {course.title}</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {materials.map((m) => <MaterialCard key={m.id} material={m} showPath />)}
            </div>
          </div>
        </section>
      ) : null}

      <CtaBand title={`Interested in ${course.title}?`} text="Send us a WhatsApp message for course details and guidance.">
        <WhatsAppLink number={settings.whatsapp_number} message={message} variant="primary" size="lg" />
      </CtaBand>
    </>
  );
}
