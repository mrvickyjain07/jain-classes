import { BookOpen, CheckCircle2, FileText, Layers, ListTree, Newspaper, Plus, Settings, TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { BackendNotice, LoadError } from "@/components/admin/notices";
import { AdminPageHeader } from "@/components/admin/shell";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/form";
import { requireAdmin } from "@/lib/auth";
import { loadAdmin } from "@/lib/cms/admin";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  await requireAdmin();
  const result = await loadAdmin();
  if (!result.ok) {
    return (
      <>
        <AdminPageHeader title="Dashboard" />
        <LoadError message={result.message} />
      </>
    );
  }
  const { courses, subjects, topics, materials, currentAffairs, issues } = result.data;
  const base = "/admin/dashboard";
  const stats = [
    { label: "Total Courses", value: courses.length, href: `${base}/courses`, icon: BookOpen },
    { label: "Total Subjects", value: subjects.length, href: `${base}/subjects`, icon: Layers },
    { label: "Total Topics", value: topics.length, href: `${base}/topics`, icon: ListTree },
    { label: "Total Study Materials", value: materials.length, href: `${base}/materials`, icon: FileText },
    { label: "Published Notes", value: materials.filter((m) => m.published).length, href: `${base}/materials`, icon: CheckCircle2 },
    { label: "Current Affairs Articles", value: currentAffairs.length, href: `${base}/current-affairs`, icon: Newspaper },
  ];
  const recent = [
    ...courses.map((r) => ({ ...r, type: "Course", href: `${base}/courses` })),
    ...subjects.map((r) => ({ ...r, type: "Subject", href: `${base}/subjects` })),
    ...topics.map((r) => ({ ...r, type: "Topic", href: `${base}/topics` })),
    ...materials.map((r) => ({ ...r, type: "Study material", href: `${base}/materials` })),
    ...currentAffairs.map((r) => ({ ...r, type: "Article", href: `${base}/current-affairs` })),
  ]
    .filter((r) => r.updated_at)
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, 8);
  const actions = [
    { label: "Add study material", href: `${base}/materials`, icon: Plus },
    { label: "Add current affairs", href: `${base}/current-affairs`, icon: Plus },
    { label: "Add topic", href: `${base}/topics`, icon: Plus },
    { label: "Website settings", href: `${base}/settings`, icon: Settings },
  ];

  return (
    <>
      <AdminPageHeader title="Dashboard" description="Manage everything students see on the Jain Classes website." />
      <BackendNotice backend={result.backend} />

      <ul className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {stats.map((s) => (
          <li key={s.label}>
            <Link href={s.href} className="block rounded-xl border border-line bg-white p-5 shadow-card transition-colors hover:border-navy/40">
              <s.icon className="size-5 text-saffron-dark" aria-hidden="true" />
              <p className="mt-3 font-heading text-3xl font-bold tabular-nums text-navy">{s.value}</p>
              <p className="text-sm text-muted">{s.label}</p>
            </Link>
          </li>
        ))}
      </ul>

      {issues.length > 0 ? (
        <section className="mt-6 rounded-xl border border-danger/30 bg-white p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold"><TriangleAlert className="size-5 text-danger" aria-hidden="true" /> Needs attention</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-[0.95rem] text-ink/85">
            {issues.slice(0, 10).map((issue) => <li key={issue}>{issue}</li>)}
          </ul>
        </section>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <section className="rounded-xl border border-line bg-white p-6 shadow-card">
          <h2 className="text-lg font-semibold">Quick actions</h2>
          <ul className="mt-4 grid gap-2.5">
            {actions.map((a) => (
              <li key={a.label}>
                <Link href={a.href} className={`${buttonVariants({ variant: "outline" })} w-full justify-start`}>
                  <a.icon aria-hidden="true" /> {a.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-xl border border-line bg-white p-6 shadow-card">
          <h2 className="text-lg font-semibold">Recent changes</h2>
          {recent.length > 0 ? (
            <ul className="mt-3 divide-y divide-line">
              {recent.map((r) => (
                <li key={`${r.type}-${r.id}`}>
                  <Link href={r.href} className="flex items-center justify-between gap-4 py-2.5 hover:text-navy-2">
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-navy">{r.title}</span>
                      <span className="text-sm text-muted">{r.type} · {formatDate(r.updated_at)}</span>
                    </span>
                    <Badge tone={r.published ? "success" : "neutral"} className="shrink-0">{r.published ? "Published" : "Unpublished"}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-muted">Changes you make will appear here.</p>
          )}
        </section>
      </div>
    </>
  );
}
