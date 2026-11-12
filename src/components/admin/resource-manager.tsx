"use client";

import { CheckCircle2, ExternalLink, Eye, EyeOff, Pencil, Plus, Search, Star, Trash2, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Badge, Field, Input, Select, Textarea } from "@/components/ui/form";
import { deleteRecord, saveRecord, setPublished } from "@/lib/cms/actions";
import { CURRENT_AFFAIRS_CATEGORIES, EXAM_CATEGORIES } from "@/lib/cms/schema";
import { defaultFileType, DRIVE_URL_HELP, FILE_TYPES, parseDriveUrl } from "@/lib/google-drive";
import { formatDate } from "@/lib/utils";
import type { EntityKey } from "@/types/cms";

export type Refs = {
  courses: { id: string; title: string; category: string }[];
  subjects: { id: string; title: string; course_id: string }[];
  topics: { id: string; title: string; subject_id: string }[];
};

type Values = Record<string, string | boolean>;
type Row = Record<string, string | number | boolean> & { id: string; title: string; published: boolean };
type Option = { value: string; label: string };

type FieldDef = {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "select" | "switch" | "date" | "drive" | "category" | "topic";
  required?: boolean;
  hint?: string;
  rows?: number;
  half?: boolean;
  options?: (refs: Refs) => Option[];
};

type Config = {
  singular: string;
  fields: FieldDef[];
  defaults: Values;
  parentLabel?: string;
  parentOptions?: (refs: Refs) => Option[];
  parentOf?: (row: Row) => string;
  context: (row: Row, refs: Refs) => string;
  columnLabel: string;
};

const coursePath = (id: string, refs: Refs) => refs.courses.find((c) => c.id === id)?.title ?? "Missing course";
const subjectPath = (id: string, refs: Refs) => {
  const s = refs.subjects.find((x) => x.id === id);
  return s ? `${coursePath(s.course_id, refs)} › ${s.title}` : "Missing subject";
};
const topicPath = (id: string, refs: Refs) => {
  const t = refs.topics.find((x) => x.id === id);
  return t ? `${subjectPath(t.subject_id, refs)} › ${t.title}` : "Missing topic";
};

const SLUG_HINT = "Web address of this page. Leave empty to create it from the title.";
const ORDER_HINT = "Smaller numbers appear first.";
const published: FieldDef = { name: "published", label: "Published (visible on the website)", type: "switch" };
const order: FieldDef = { name: "display_order", label: "Display order", type: "number", hint: ORDER_HINT, half: true };

const CONFIG: Record<EntityKey, Config> = {
  courses: {
    singular: "course",
    columnLabel: "Examination",
    context: (row) => String(row.category),
    defaults: { title: "", slug: "", category: "MPSC", description: "", image: "", display_order: "0", published: true },
    fields: [
      { name: "title", label: "Course title", type: "text", required: true },
      { name: "category", label: "Examination category", type: "category", required: true, half: true, hint: "Choose from the list or type a new category." },
      order,
      { name: "slug", label: "Web address (slug)", type: "text", hint: SLUG_HINT },
      { name: "description", label: "Description", type: "textarea", rows: 5, hint: "Shown on the course card and course page. Leave a blank line between paragraphs." },
      { name: "image", label: "Image (optional)", type: "text", hint: "A path such as /images/course.jpg. Leave empty if not needed." },
      published,
    ],
  },
  subjects: {
    singular: "subject",
    columnLabel: "Course",
    parentLabel: "All courses",
    parentOptions: (refs) => refs.courses.map((c) => ({ value: c.id, label: c.title })),
    parentOf: (row) => String(row.course_id),
    context: (row, refs) => coursePath(String(row.course_id), refs),
    defaults: { course_id: "", title: "", slug: "", description: "", display_order: "0", published: true },
    fields: [
      { name: "course_id", label: "Course", type: "select", required: true, options: (refs) => refs.courses.map((c) => ({ value: c.id, label: c.title })) },
      { name: "title", label: "Subject title", type: "text", required: true },
      { name: "slug", label: "Web address (slug)", type: "text", hint: SLUG_HINT, half: true },
      order,
      { name: "description", label: "Description (optional)", type: "textarea", rows: 3 },
      published,
    ],
  },
  topics: {
    singular: "topic",
    columnLabel: "Subject",
    parentLabel: "All subjects",
    parentOptions: (refs) => refs.subjects.map((s) => ({ value: s.id, label: subjectPath(s.id, refs) })),
    parentOf: (row) => String(row.subject_id),
    context: (row, refs) => subjectPath(String(row.subject_id), refs),
    defaults: { subject_id: "", title: "", slug: "", description: "", display_order: "0", published: true },
    fields: [
      { name: "subject_id", label: "Subject", type: "select", required: true, options: (refs) => refs.subjects.map((s) => ({ value: s.id, label: subjectPath(s.id, refs) })) },
      { name: "title", label: "Topic title", type: "text", required: true },
      { name: "slug", label: "Web address (slug)", type: "text", hint: SLUG_HINT, half: true },
      order,
      { name: "description", label: "Description (optional)", type: "textarea", rows: 3 },
      published,
    ],
  },
  materials: {
    singular: "study material",
    columnLabel: "Course › Subject › Topic",
    parentLabel: "All topics",
    parentOptions: (refs) => refs.topics.map((t) => ({ value: t.id, label: topicPath(t.id, refs) })),
    parentOf: (row) => String(row.topic_id),
    context: (row, refs) => topicPath(String(row.topic_id), refs),
    defaults: { topic_id: "", title: "", description: "", google_drive_url: "", file_type: "PDF", display_order: "0", published: true, featured: false },
    fields: [
      { name: "topic_id", label: "Topic", type: "topic", required: true },
      { name: "title", label: "Document title", type: "text", required: true },
      { name: "description", label: "Description (optional)", type: "textarea", rows: 3 },
      { name: "google_drive_url", label: "Google Drive URL", type: "drive", required: true },
      { name: "file_type", label: "File type", type: "select", half: true, options: () => FILE_TYPES.map((t) => ({ value: t, label: t })) },
      order,
      published,
      { name: "featured", label: "Featured (highlight on the Study Materials page)", type: "switch" },
    ],
  },
  "current-affairs": {
    singular: "article",
    columnLabel: "Category",
    parentLabel: "All categories",
    parentOptions: () => CURRENT_AFFAIRS_CATEGORIES.map((c) => ({ value: c, label: c })),
    parentOf: (row) => String(row.category),
    context: (row) => String(row.category),
    defaults: { title: "", slug: "", category: "", relevant_exam: "", summary: "", content: "", source_urls: "", published_at: "", published: false },
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "category", label: "Category", type: "select", required: true, half: true, options: () => CURRENT_AFFAIRS_CATEGORIES.map((c) => ({ value: c, label: c })) },
      { name: "relevant_exam", label: "Relevant examination", type: "text", half: true, hint: "For example: UPSC, MPSC Rajyaseva" },
      { name: "summary", label: "Summary", type: "textarea", rows: 3, required: true, hint: "Two or three sentences shown on the list page." },
      { name: "content", label: "Full content", type: "textarea", rows: 12, required: true, hint: "Write in your own words. Blank line = new paragraph. Start a line with “## ” for a heading or “- ” for a bullet point." },
      { name: "source_urls", label: "Source links", type: "textarea", rows: 2, hint: "One link per line, starting with https://" },
      { name: "published_at", label: "Publication date", type: "date", half: true, hint: "Leave empty to use today's date when published." },
      { name: "slug", label: "Web address (slug)", type: "text", hint: SLUG_HINT, half: true },
      published,
    ],
  },
};

function toValues(config: Config, row?: Row): Values {
  if (!row) return { ...config.defaults };
  const values: Values = { id: row.id };
  for (const f of config.fields) {
    const v = row[f.name];
    if (f.type === "switch") values[f.name] = Boolean(v);
    else if (f.type === "date") values[f.name] = String(v ?? "").slice(0, 10);
    else values[f.name] = v === undefined || v === null ? "" : String(v);
  }
  return values;
}

function TopicPicker({ value, onChange, refs, error }: { value: string; onChange: (id: string) => void; refs: Refs; error?: string }) {
  const topic = refs.topics.find((t) => t.id === value);
  const subject0 = refs.subjects.find((s) => s.id === topic?.subject_id);
  const course0 = refs.courses.find((c) => c.id === subject0?.course_id);
  const [exam, setExam] = useState(course0?.category ?? "");
  const [course, setCourse] = useState(course0?.id ?? "");
  const [subject, setSubject] = useState(subject0?.id ?? "");

  const exams = Array.from(new Set(refs.courses.map((c) => c.category)));
  const courses = refs.courses.filter((c) => !exam || c.category === exam);
  const subjects = refs.subjects.filter((s) => s.course_id === course);
  const topics = refs.topics.filter((t) => t.subject_id === subject);

  return (
    <fieldset className="grid gap-4 rounded-lg border border-line bg-paper p-4 sm:grid-cols-2">
      <legend className="px-1 text-sm font-semibold text-navy">Where should this note appear? <span className="text-danger">*</span></legend>
      <Field id="pick-exam" label="Examination">
        <Select id="pick-exam" value={exam} onChange={(e) => { setExam(e.target.value); setCourse(""); setSubject(""); onChange(""); }}>
          <option value="">All examinations</option>
          {exams.map((x) => <option key={x} value={x}>{x}</option>)}
        </Select>
      </Field>
      <Field id="pick-course" label="Course">
        <Select id="pick-course" value={course} onChange={(e) => { setCourse(e.target.value); setSubject(""); onChange(""); }}>
          <option value="">Select course</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </Select>
      </Field>
      <Field id="pick-subject" label="Subject">
        <Select id="pick-subject" value={subject} disabled={!course} onChange={(e) => { setSubject(e.target.value); onChange(""); }}>
          <option value="">{course ? (subjects.length ? "Select subject" : "No subjects in this course yet") : "Choose a course first"}</option>
          {subjects.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
        </Select>
      </Field>
      <Field id="field-topic_id" label="Topic" error={error}>
        <Select id="field-topic_id" value={value} disabled={!subject} aria-invalid={Boolean(error)} onChange={(e) => onChange(e.target.value)}>
          <option value="">{subject ? (topics.length ? "Select topic" : "No topics in this subject yet") : "Choose a subject first"}</option>
          {topics.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
        </Select>
      </Field>
    </fieldset>
  );
}

function DriveField({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string }) {
  const link = value.trim() ? parseDriveUrl(value) : null;
  return (
    <div>
      <div className="mb-3 rounded-lg border border-gold/50 bg-gold/10 px-4 py-3 text-sm leading-relaxed text-ink">
        <strong>How to add a note:</strong> Upload your PDF to the official Jain Classes Google Drive, set sharing permission to <strong>Anyone with the link – Viewer</strong>, copy the link and paste it here.
        <span className="mt-1 block text-ink/75">Remember: anyone who has the link can open the file directly, so only share notes that are meant to be free and public.</span>
      </div>
      <Field id="field-google_drive_url" label="Google Drive URL" required error={error} hint={DRIVE_URL_HELP}>
        <Input id="field-google_drive_url" type="url" inputMode="url" value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://drive.google.com/file/d/…/view" aria-invalid={Boolean(error) || (value.trim() !== "" && !link)} autoComplete="off" />
      </Field>
      <div aria-live="polite" className="mt-2 text-sm">
        {link ? (
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-success">
            <span className="inline-flex items-center gap-1.5 font-medium"><CheckCircle2 className="size-4" aria-hidden="true" /> Valid Google Drive link</span>
            <a href={link.open} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-navy underline">Preview link <ExternalLink className="size-3.5" aria-hidden="true" /></a>
          </p>
        ) : value.trim() && !error ? (
          <p className="inline-flex items-center gap-1.5 font-medium text-danger"><TriangleAlert className="size-4" aria-hidden="true" /> This does not look like a Google Drive link.</p>
        ) : null}
      </div>
    </div>
  );
}

export function ResourceManager({
  entity,
  rows,
  refs,
  readOnly = false,
}: {
  entity: EntityKey;
  rows: Row[];
  refs: Refs;
  readOnly?: boolean;
}) {
  const config = CONFIG[entity];
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [parent, setParent] = useState("");
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState<Values | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const parentOptions = config.parentOptions?.(refs) ?? [];
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (parent && config.parentOf?.(row) !== parent) return false;
      if (status === "published" && !row.published) return false;
      if (status === "draft" && row.published) return false;
      if (!q) return true;
      return `${row.title} ${config.context(row, refs)} ${row.slug ?? ""}`.toLowerCase().includes(q);
    });
  }, [rows, query, parent, status, config, refs]);

  const openNew = () => {
    const values = { ...config.defaults };
    if (parent && entity === "subjects") values.course_id = parent;
    if (parent && entity === "topics") values.subject_id = parent;
    if (parent && entity === "materials") values.topic_id = parent;
    if (parent && entity === "current-affairs") values.category = parent;
    if (entity !== "current-affairs") {
      const siblings = rows.filter((r) => !parent || config.parentOf?.(r) === parent);
      values.display_order = String(siblings.reduce((max, r) => Math.max(max, Number(r.display_order) || 0), 0) + 1);
    }
    setErrors({});
    setEditing(values);
  };

  const set = (name: string, value: string | boolean) => {
    setEditing((v) => {
      if (!v) return v;
      const next = { ...v, [name]: value };
      if (name === "google_drive_url" && typeof value === "string") {
        const link = parseDriveUrl(value);
        if (link) next.file_type = link.kind === "file" ? (v.file_type === "PDF" || !v.file_type ? "PDF" : v.file_type) : defaultFileType(link.kind);
      }
      return next;
    });
    setErrors((e) => (e[name] ? { ...e, [name]: "" } : e));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    startTransition(async () => {
      const result = await saveRecord(entity, editing);
      if (result.ok) {
        toast.success(result.message);
        setEditing(null);
        router.refresh();
      } else {
        setErrors(result.fieldErrors ?? {});
        toast.error(result.error);
        const first = Object.keys(result.fieldErrors ?? {})[0];
        if (first) document.getElementById(`field-${first}`)?.focus();
      }
    });
  };

  const togglePublished = (row: Row) => {
    setBusyId(row.id);
    startTransition(async () => {
      const result = await setPublished(entity, row.id, !row.published);
      if (result.ok) toast.success(result.message);
      else toast.error(result.error);
      setBusyId(null);
      router.refresh();
    });
  };

  const confirmDelete = () => {
    if (!deleting) return;
    startTransition(async () => {
      const result = await deleteRecord(entity, deleting.id);
      if (result.ok) toast.success(result.message);
      else toast.error(result.error);
      setDeleting(null);
      router.refresh();
    });
  };

  const renderField = (f: FieldDef) => {
    if (!editing) return null;
    const id = `field-${f.name}`;
    const value = editing[f.name];
    const error = errors[f.name] || undefined;
    const common = { id, "aria-invalid": Boolean(error), "aria-describedby": error ? `${id}-error` : f.hint ? `${id}-hint` : undefined };
    const span = f.half ? "" : "sm:col-span-2";

    if (f.type === "topic") {
      return <div key={f.name} className="sm:col-span-2"><TopicPicker value={String(value ?? "")} onChange={(v) => set(f.name, v)} refs={refs} error={error} /></div>;
    }
    if (f.type === "drive") {
      return <div key={f.name} className="sm:col-span-2"><DriveField value={String(value ?? "")} onChange={(v) => set(f.name, v)} error={error} /></div>;
    }
    if (f.type === "switch") {
      return (
        <label key={f.name} htmlFor={id} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-line bg-paper px-4 py-2.5 sm:col-span-2">
          <input id={id} type="checkbox" checked={Boolean(value)} onChange={(e) => set(f.name, e.target.checked)} className="size-5 accent-[#102a43]" />
          <span className="text-[0.95rem] font-medium text-ink">{f.label}</span>
        </label>
      );
    }
    return (
      <Field key={f.name} id={id} label={f.label} required={f.required} error={error} hint={f.hint} className={span}>
        {f.type === "textarea" ? (
          <Textarea {...common} rows={f.rows ?? 4} value={String(value ?? "")} onChange={(e) => set(f.name, e.target.value)} />
        ) : f.type === "select" ? (
          <Select {...common} value={String(value ?? "")} onChange={(e) => set(f.name, e.target.value)}>
            <option value="">Select…</option>
            {f.options?.(refs).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        ) : f.type === "category" ? (
          <>
            <Input {...common} list={`${id}-list`} value={String(value ?? "")} onChange={(e) => set(f.name, e.target.value)} maxLength={60} />
            <datalist id={`${id}-list`}>
              {Array.from(new Set([...EXAM_CATEGORIES, ...refs.courses.map((c) => c.category)])).map((c) => <option key={c} value={c} />)}
            </datalist>
          </>
        ) : (
          <Input {...common} type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"} min={f.type === "number" ? 0 : undefined} max={f.type === "number" ? 9999 : undefined} value={String(value ?? "")} onChange={(e) => set(f.name, e.target.value)} />
        )}
      </Field>
    );
  };

  const isEdit = Boolean(editing?.id);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <label htmlFor="admin-search" className="sr-only">Search {config.singular}s</label>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden="true" />
          <Input id="admin-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${config.singular}s`} className="pl-11" />
        </div>
        {parentOptions.length > 0 ? (
          <Select aria-label={`Filter by ${config.columnLabel}`} value={parent} onChange={(e) => setParent(e.target.value)} className="lg:w-72">
            <option value="">{config.parentLabel}</option>
            {parentOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        ) : null}
        <Select aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)} className="lg:w-40">
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Unpublished</option>
        </Select>
        <Button variant="navy" onClick={openNew} disabled={readOnly} className="shrink-0">
          <Plus aria-hidden="true" /> Add {config.singular}
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-line bg-white shadow-card">
        <table className="w-full min-w-[42rem] text-left text-[0.93rem]">
          <caption className="sr-only">{config.singular}s</caption>
          <thead className="border-b border-line bg-paper text-xs uppercase tracking-wider text-muted">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Title</th>
              <th scope="col" className="px-4 py-3 font-semibold">{config.columnLabel}</th>
              <th scope="col" className="px-4 py-3 font-semibold">{entity === "current-affairs" ? "Date" : "Order"}</th>
              <th scope="col" className="px-4 py-3 font-semibold">Status</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.map((row) => {
              const link = entity === "materials" ? parseDriveUrl(String(row.google_drive_url)) : null;
              return (
                <tr key={row.id} className="align-top">
                  <th scope="row" className="max-w-[18rem] px-4 py-3.5 font-medium text-navy">
                    <span className="[overflow-wrap:anywhere]">{row.title}</span>
                    {row.featured ? <Star className="ml-1.5 inline size-4 fill-gold text-gold" aria-label="Featured" /> : null}
                    {entity === "materials" ? (
                      <span className="mt-1 flex flex-wrap items-center gap-2 text-xs font-normal">
                        <Badge>{String(row.file_type)}</Badge>
                        {link ? (
                          <a href={link.open} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-navy underline">Preview link <ExternalLink className="size-3" aria-hidden="true" /></a>
                        ) : (
                          <Badge tone="danger">Invalid Drive link</Badge>
                        )}
                      </span>
                    ) : row.slug ? (
                      <span className="mt-0.5 block text-xs font-normal text-muted">/{String(row.slug)}</span>
                    ) : null}
                  </th>
                  <td className="max-w-[16rem] px-4 py-3.5 text-ink/85">{config.context(row, refs)}</td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-ink/85">
                    {entity === "current-affairs" ? formatDate(String(row.published_at)) || "Not set" : row.display_order}
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge tone={row.published ? "success" : "neutral"}>{row.published ? "Published" : "Unpublished"}</Badge>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" title={row.published ? "Unpublish" : "Publish"} aria-label={`${row.published ? "Unpublish" : "Publish"} ${row.title}`} disabled={readOnly || (pending && busyId === row.id)} onClick={() => togglePublished(row)}>
                        {row.published ? <EyeOff /> : <Eye />}
                      </Button>
                      <Button variant="ghost" size="icon" title="Edit" aria-label={`Edit ${row.title}`} disabled={readOnly} onClick={() => { setErrors({}); setEditing(toValues(config, row)); }}>
                        <Pencil />
                      </Button>
                      <Button variant="ghost" size="icon" title="Delete" aria-label={`Delete ${row.title}`} disabled={readOnly} onClick={() => setDeleting(row)} className="text-danger hover:bg-danger/10">
                        <Trash2 />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted">
                  {rows.length === 0 ? `No ${config.singular}s yet. Use “Add ${config.singular}” to create the first one.` : "Nothing matches these filters."}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-muted">Showing {filtered.length} of {rows.length}</p>

      <Dialog open={editing !== null} onOpenChange={(open) => { if (!open && !pending) setEditing(null); }}>
        <DialogContent className="max-w-2xl">
          <div className="border-b border-line px-6 py-4 pr-14">
            <DialogTitle className="font-heading text-lg font-semibold text-navy">{isEdit ? "Edit" : "Add"} {config.singular}</DialogTitle>
            <DialogDescription className="text-sm text-muted">Fields marked * are required.</DialogDescription>
          </div>
          {editing ? (
            <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
              <div className="grid flex-1 gap-5 overflow-y-auto px-6 py-5 sm:grid-cols-2">{config.fields.map(renderField)}</div>
              <div className="flex flex-col-reverse gap-2 border-t border-line bg-paper px-6 py-4 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={() => setEditing(null)} disabled={pending}>Cancel</Button>
                <Button type="submit" variant="navy" disabled={pending}>{pending ? "Saving…" : isEdit ? "Save changes" : `Add ${config.singular}`}</Button>
              </div>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={deleting !== null} onOpenChange={(open) => { if (!open && !pending) setDeleting(null); }}>
        <DialogContent className="max-w-md">
          <div className="px-6 pb-2 pt-6 pr-14">
            <DialogTitle className="font-heading text-lg font-semibold text-navy">Delete this {config.singular}?</DialogTitle>
            <DialogDescription className="mt-2 text-[0.95rem] text-ink/85">
              “{deleting?.title}” will be removed permanently from the spreadsheet. This cannot be undone. To hide it without deleting, use Unpublish instead.
              {entity === "materials" ? " The file itself stays in Google Drive." : ""}
            </DialogDescription>
          </div>
          <div className="flex flex-col-reverse gap-2 px-6 py-5 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setDeleting(null)} disabled={pending}>Keep it</Button>
            <Button variant="danger" onClick={confirmDelete} disabled={pending}>{pending ? "Deleting…" : "Delete permanently"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
