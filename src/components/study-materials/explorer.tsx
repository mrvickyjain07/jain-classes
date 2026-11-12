"use client";

import { BookOpen, ChevronRight, FileText, Layers, Search, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/shared/section";
import { Badge, Input } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import type { PublicCourse, PublicMaterial } from "@/types/cms";
import { MaterialCard } from "./material-card";

const BASE = "/study-materials";
const count = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

function Tile({ href, title, meta, description, icon: Icon }: { href: string; title: string; meta: string; description?: string; icon: typeof BookOpen }) {
  return (
    <Link href={href} scroll={false} className="group flex h-full items-start gap-4 rounded-xl border border-line bg-white p-5 shadow-card transition-colors hover:border-navy/40">
      <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-saffron/15 text-saffron-dark" aria-hidden="true">
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-heading text-base font-semibold text-navy [overflow-wrap:anywhere]">{title}</span>
        {description ? <span className="mt-1 line-clamp-2 block text-sm text-muted">{description}</span> : null}
        <span className="mt-1.5 block text-sm text-muted">{meta}</span>
      </span>
      <ChevronRight className="mt-1 size-5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-navy" aria-hidden="true" />
    </Link>
  );
}

export function MaterialsExplorer({ courses, materials }: { courses: PublicCourse[]; materials: PublicMaterial[] }) {
  const params = useSearchParams();
  const [query, setQuery] = useState("");
  const [exam, setExam] = useState("");

  const course = courses.find((c) => c.slug === params.get("course"));
  const subject = course?.subjects.find((s) => s.slug === params.get("subject"));
  const topic = subject?.topics.find((t) => t.slug === params.get("topic"));
  const exams = useMemo(() => Array.from(new Set(courses.map((c) => c.category))), [courses]);

  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!q) return [];
    const words = q.split(/\s+/);
    return materials.filter((m) => {
      if (exam && m.category !== exam) return false;
      const haystack = `${m.title} ${m.description} ${m.topicTitle} ${m.subjectTitle} ${m.courseTitle} ${m.category}`.toLowerCase();
      return words.every((w) => haystack.includes(w));
    });
  }, [q, exam, materials]);

  const crumbs = [
    { label: "All examinations", href: BASE },
    ...(course ? [{ label: course.title, href: `${BASE}?course=${course.slug}` }] : []),
    ...(course && subject ? [{ label: subject.title, href: `${BASE}?course=${course.slug}&subject=${subject.slug}` }] : []),
    ...(course && subject && topic ? [{ label: topic.title, href: `${BASE}?course=${course.slug}&subject=${subject.slug}&topic=${topic.slug}` }] : []),
  ];

  const featured = materials.filter((m) => m.featured).slice(0, 6);
  const recent = materials.slice(0, 6);
  const grid = "grid gap-4 sm:grid-cols-2 lg:grid-cols-3";
  const h2 = "mb-5 text-2xl font-semibold";

  return (
    <div id="browse" className="scroll-mt-24">
      <div className="rounded-xl border border-line bg-white p-4 shadow-card md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <label htmlFor="material-search" className="sr-only">Search study materials</label>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden="true" />
            <Input id="material-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by examination, subject, topic or title" className="pl-11 pr-10" autoComplete="off" />
            {query ? (
              <button type="button" onClick={() => setQuery("")} className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-muted hover:text-navy" aria-label="Clear search">
                <X className="size-4" />
              </button>
            ) : null}
          </div>
          {exams.length > 1 ? (
            <div role="group" aria-label="Filter by examination" className="flex flex-wrap gap-2">
              {["", ...exams].map((x) => (
                <button
                  key={x || "all"}
                  type="button"
                  aria-pressed={exam === x}
                  onClick={() => setExam(x)}
                  className={cn(
                    "min-h-10 rounded-full border px-4 text-sm font-semibold transition-colors",
                    exam === x ? "border-navy bg-navy text-white" : "border-navy/20 bg-white text-navy hover:border-navy",
                  )}
                >
                  {x || "All"}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {q ? (
        <section className="mt-8" aria-live="polite">
          <h2 className={h2}>{count(results.length, "result")} for “{query.trim()}”</h2>
          {results.length > 0 ? (
            <div className={grid}>{results.map((m) => <MaterialCard key={m.id} material={m} showPath />)}</div>
          ) : (
            <EmptyState title="No study materials match your search">Try a different word, or browse by examination below.</EmptyState>
          )}
        </section>
      ) : (
        <>
          {crumbs.length > 1 ? (
            <nav aria-label="Breadcrumb" className="mt-8">
              <ol className="flex flex-wrap items-center gap-1.5 text-sm">
                {crumbs.map((c, i) => (
                  <li key={c.href} className="flex items-center gap-1.5">
                    {i > 0 ? <ChevronRight className="size-4 text-muted" aria-hidden="true" /> : null}
                    {i === crumbs.length - 1 ? (
                      <span aria-current="page" className="font-semibold text-navy">{c.label}</span>
                    ) : (
                      <Link href={c.href} scroll={false} className="text-muted underline-offset-4 hover:text-navy hover:underline">{c.label}</Link>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}

          <section className="mt-6">
            {!course ? (
              <>
                {(exam ? [exam] : exams).map((x) => (
                  <div key={x} className="mt-8 first:mt-2">
                    <h2 className={h2}>{x}</h2>
                    <div className={grid}>
                      {courses.filter((c) => c.category === x).map((c) => (
                        <Tile key={c.id} href={`${BASE}?course=${c.slug}`} title={c.title} icon={BookOpen} meta={`${count(c.subjects.length, "subject")} · ${count(c.materialCount, "free resource")}`} />
                      ))}
                    </div>
                  </div>
                ))}
                {courses.length === 0 ? <EmptyState title="Study materials are being prepared">Please check back soon.</EmptyState> : null}
              </>
            ) : !subject ? (
              <>
                <h2 className={h2}>{course.title}: choose a subject</h2>
                {course.subjects.length > 0 ? (
                  <div className={grid}>
                    {course.subjects.map((s) => (
                      <Tile key={s.id} href={`${BASE}?course=${course.slug}&subject=${s.slug}`} title={s.title} description={s.description} icon={Layers} meta={`${count(s.topics.length, "topic")} · ${count(s.materialCount, "free resource")}`} />
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No subjects have been added yet">Subjects for {course.title} will appear here soon.</EmptyState>
                )}
              </>
            ) : !topic ? (
              <>
                <h2 className={h2}>{subject.title}: choose a topic</h2>
                {subject.topics.length > 0 ? (
                  <div className={grid}>
                    {subject.topics.map((t) => (
                      <Tile key={t.id} href={`${BASE}?course=${course.slug}&subject=${subject.slug}&topic=${t.slug}`} title={t.title} description={t.description} icon={FileText} meta={t.materials.length > 0 ? count(t.materials.length, "free resource") : "Notes coming soon"} />
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No topics have been added yet">Topics for {subject.title} will appear here soon.</EmptyState>
                )}
              </>
            ) : (
              <>
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-semibold">{topic.title}</h2>
                  <Badge tone="success">Free access</Badge>
                </div>
                {topic.description ? <p className="-mt-2 mb-6 max-w-3xl text-muted">{topic.description}</p> : null}
                {topic.materials.length > 0 ? (
                  <div className={grid}>{topic.materials.map((m) => <MaterialCard key={m.id} material={m} />)}</div>
                ) : (
                  <EmptyState title="Notes for this topic are coming soon">Study materials for {topic.title} have not been published yet.</EmptyState>
                )}
              </>
            )}
          </section>

          {!course && featured.length > 0 ? (
            <section className="mt-14">
              <h2 className={h2}>Featured resources</h2>
              <div className={grid}>{featured.map((m) => <MaterialCard key={m.id} material={m} showPath />)}</div>
            </section>
          ) : null}
          {!course && recent.length > 0 ? (
            <section className="mt-14">
              <h2 className={h2}>Recently added notes</h2>
              <div className={grid}>{recent.map((m) => <MaterialCard key={m.id} material={m} showPath />)}</div>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
