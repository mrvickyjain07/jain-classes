import { ArrowRight, CalendarDays, Layers } from "lucide-react";
import Link from "next/link";
import { CourseCard } from "@/components/courses/course-card";
import { CtaBand, Hero, ProfessorPhoto, WhyChoose } from "@/components/home/sections";
import { RichText, SectionHeading } from "@/components/shared/section";
import { WhatsAppLink } from "@/components/shared/whatsapp";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/form";
import { getSiteContent } from "@/lib/cms/data";
import { cn, formatDate } from "@/lib/utils";
import { contextualMessage } from "@/lib/whatsapp";

export default async function HomePage() {
  const { settings, courses, materials, currentAffairs } = await getSiteContent();
  const wa = settings.whatsapp_number;
  const name = settings.institute_name;

  // One row per subject title, combined across courses, for the preview grid.
  const subjectMap = new Map<string, { title: string; topics: number; resources: number; href: string }>();
  for (const c of courses) {
    for (const s of c.subjects) {
      const entry = subjectMap.get(s.title) ?? { title: s.title, topics: 0, resources: 0, href: `/study-materials?course=${c.slug}&subject=${s.slug}` };
      entry.topics += s.topics.length;
      entry.resources += s.materialCount;
      subjectMap.set(s.title, entry);
    }
  }
  const subjects = [...subjectMap.values()].sort((a, b) => b.resources - a.resources || b.topics - a.topics).slice(0, 8);
  const latest = materials.slice(0, 4);
  const news = currentAffairs.slice(0, 3);

  return (
    <>
      <Hero settings={settings} />

      <section className="section-y">
        <div className="container-page grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <SectionHeading eyebrow="About the institute" title={`Welcome to ${name}`} />
          <div>
            <RichText text={settings.home_intro} className="text-lg text-ink/90" />
            <Link href="/about" className={cn(buttonVariants({ variant: "outline" }), "mt-7")}>
              More about {name} <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="section-y border-y border-line bg-white">
        <div className="container-page grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <ProfessorPhoto settings={settings} />
          <div>
            <SectionHeading eyebrow="About the professor" title={settings.professor_name} />
            <RichText text={settings.professor_intro} className="mt-5 text-lg text-ink/90" />
            <div className="mt-6 border-l-4 border-saffron pl-5">
              <p className="text-sm font-semibold uppercase tracking-wider text-muted">Teaching philosophy</p>
              <RichText text={settings.teaching_philosophy} className="mt-2 text-ink/90" />
            </div>
            <RichText text={settings.professor_guidance} className="mt-6 text-ink/90" />
            <WhatsAppLink number={wa} message={contextualMessage({ type: "professor" }, name)} className="mt-7">
              Connect with Professor
            </WhatsAppLink>
          </div>
        </div>
      </section>

      <section className="section-y">
        <div className="container-page">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <SectionHeading eyebrow="Courses" title="Guidance for every stage of your preparation" description="Choose your examination to see subjects, topics and free study resources." />
            <Link href="/courses" className={cn(buttonVariants({ variant: "outline" }), "shrink-0")}>All courses <ArrowRight aria-hidden="true" /></Link>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => <CourseCard key={c.id} course={c} whatsapp={wa} institute={name} />)}
          </div>
        </div>
      </section>

      <section className="section-y border-y border-line bg-white">
        <div className="container-page">
          <SectionHeading eyebrow="Why Jain Classes" title={`Why choose ${name}?`} />
          <WhyChoose className="mt-10" />
        </div>
      </section>

      <section className="section-y">
        <div className="container-page">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <SectionHeading eyebrow="Study materials" title="Free notes, organised subject by subject" description="Open any subject and start reading. No registration, no login, no fees." />
            <Link href="/study-materials" className={cn(buttonVariants(), "shrink-0")}>Explore Free Study Materials <ArrowRight aria-hidden="true" /></Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {subjects.map((s) => (
              <Link key={s.title} href={s.href} className="group rounded-xl border border-line bg-white p-5 shadow-card transition-colors hover:border-navy/40">
                <div className="flex items-center justify-between gap-2">
                  <Layers className="size-5 text-saffron-dark" aria-hidden="true" />
                  <Badge tone="success">Free</Badge>
                </div>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted">
                  {s.topics > 0 ? `${s.topics} topic${s.topics === 1 ? "" : "s"}` : "Topics coming soon"}
                  {s.resources > 0 ? ` · ${s.resources} resource${s.resources === 1 ? "" : "s"}` : ""}
                </p>
              </Link>
            ))}
          </div>
          {latest.length > 0 ? (
            <div className="mt-10 rounded-xl border border-line bg-white p-6">
              <h3 className="text-lg font-semibold">Latest resources</h3>
              <ul className="mt-3 divide-y divide-line">
                {latest.map((m) => (
                  <li key={m.id}>
                    <Link href={`/study-materials?course=${m.courseSlug}&subject=${m.subjectSlug}&topic=${m.topicSlug}`} className="flex flex-col gap-1 py-3 hover:text-navy-2 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                      <span className="font-medium text-navy [overflow-wrap:anywhere]">{m.title}</span>
                      <span className="shrink-0 text-sm text-muted">{m.subjectTitle} · {formatDate(m.created_at)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      {news.length > 0 ? (
        <section className="section-y border-t border-line bg-white">
          <div className="container-page">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <SectionHeading eyebrow="Current affairs" title="Recent updates for your examination" />
              <Link href="/current-affairs" className={cn(buttonVariants({ variant: "outline" }), "shrink-0")}>All current affairs <ArrowRight aria-hidden="true" /></Link>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {news.map((a) => (
                <article key={a.id} className="flex flex-col rounded-xl border border-line bg-paper p-6">
                  <Badge tone="saffron" className="self-start">{a.category}</Badge>
                  <h3 className="mt-4 text-lg font-semibold leading-snug">
                    <Link href={`/current-affairs/${a.slug}`} className="hover:underline decoration-saffron underline-offset-4">{a.title}</Link>
                  </h3>
                  <p className="mt-2 line-clamp-3 text-[0.95rem] text-muted">{a.summary}</p>
                  <div className="mt-auto flex items-center justify-between pt-5 text-sm">
                    <span className="flex items-center gap-1.5 text-muted"><CalendarDays className="size-4" aria-hidden="true" />{formatDate(a.published_at)}</span>
                    <Link href={`/current-affairs/${a.slug}`} className="font-semibold text-navy hover:underline">Read More<span className="sr-only">: {a.title}</span></Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <CtaBand tone="saffron" title="Quality Education. Free Study Resources. Better Preparation." text={`Access educational resources and prepare for your competitive examination journey with ${name}.`}>
        <Link href="/study-materials" className={buttonVariants({ variant: "navy", size: "lg" })}>Explore Free Study Materials <ArrowRight aria-hidden="true" /></Link>
      </CtaBand>

      <CtaBand title="Need Guidance for Your Competitive Examination Preparation?" text="Send us a message on WhatsApp or reach us through the contact page.">
        <WhatsAppLink number={wa} message={contextualMessage({ type: "guidance" }, name)} variant="primary" size="lg" />
        <Link href="/contact" className={buttonVariants({ variant: "light", size: "lg" })}>Contact {name}</Link>
      </CtaBand>
    </>
  );
}
