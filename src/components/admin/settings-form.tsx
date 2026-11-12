"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/form";
import { saveSettings, setupSpreadsheet } from "@/lib/cms/actions";

type FieldDef = { key: string; label: string; rows?: number; hint?: string; half?: boolean; type?: string };

const GROUPS: { title: string; description?: string; fields: FieldDef[] }[] = [
  {
    title: "Institute and contact",
    fields: [
      { key: "institute_name", label: "Institute name", half: true },
      { key: "professor_name", label: "Professor name", half: true },
      { key: "phone", label: "Contact number", half: true, type: "tel", hint: "10-digit mobile number" },
      { key: "whatsapp_number", label: "WhatsApp number", half: true, type: "tel", hint: "With country code, e.g. 917558536630" },
      { key: "email", label: "Email", half: true, type: "email" },
      { key: "location", label: "Location", half: true },
      { key: "tagline", label: "Tagline" },
    ],
  },
  {
    title: "Homepage",
    fields: [
      { key: "hero_headline", label: "Main headline" },
      { key: "hero_subtitle", label: "Subtitle", hint: "Separate items with | for example: UPSC | MPSC | Competitive Examinations" },
      { key: "hero_description", label: "Hero description", rows: 3 },
      { key: "home_intro", label: "Welcome to Jain Classes (introduction)", rows: 6, hint: "Leave a blank line between paragraphs." },
    ],
  },
  {
    title: "About section",
    description: "Write only facts you want published. Nothing is added automatically.",
    fields: [
      { key: "about_intro", label: "About Jain Classes", rows: 5 },
      { key: "vision", label: "Vision", rows: 3 },
      { key: "mission", label: "Mission", rows: 3 },
      { key: "teaching_philosophy", label: "Teaching philosophy", rows: 4 },
      { key: "educational_approach", label: "Educational approach", rows: 4 },
      { key: "professor_intro", label: "Professor introduction", rows: 4 },
      { key: "professor_guidance", label: "Guidance approach", rows: 4 },
    ],
  },
  {
    title: "Social media links",
    description: "Leave a field empty to hide that link.",
    fields: [
      { key: "social_youtube", label: "YouTube", half: true, type: "url" },
      { key: "social_telegram", label: "Telegram", half: true, type: "url" },
      { key: "social_instagram", label: "Instagram", half: true, type: "url" },
      { key: "social_facebook", label: "Facebook", half: true, type: "url" },
      { key: "social_x", label: "X (Twitter)", half: true, type: "url" },
    ],
  },
  {
    title: "Images and search engines",
    description: "Image files live in the website's public/images folder. Change these paths only after a new file has been added there.",
    fields: [
      { key: "logo_path", label: "Logo reference", half: true },
      { key: "professor_image_path", label: "Professor image reference", half: true },
      { key: "seo_title", label: "Search title (max 70 characters)" },
      { key: "seo_description", label: "Search description (max 200 characters)", rows: 3 },
    ],
  },
];

export function SettingsForm({ initial, readOnly }: { initial: Record<string, string>; readOnly: boolean }) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const payload = Object.fromEntries(GROUPS.flatMap((g) => g.fields).map((f) => [f.key, values[f.key] ?? ""]));
      const result = await saveSettings(payload);
      if (result.ok) {
        setErrors({});
        toast.success(result.message);
        router.refresh();
      } else {
        setErrors(result.fieldErrors ?? {});
        toast.error(result.error);
        const first = Object.keys(result.fieldErrors ?? {})[0];
        if (first) document.getElementById(`setting-${first}`)?.focus();
      }
    });
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      {GROUPS.map((group) => (
        <fieldset key={group.title} className="rounded-xl border border-line bg-white p-6 shadow-card">
          <legend className="float-left mb-1 w-full font-heading text-lg font-semibold text-navy">{group.title}</legend>
          {group.description ? <p className="clear-both text-sm text-muted">{group.description}</p> : null}
          <div className="clear-both grid gap-5 pt-4 sm:grid-cols-2">
            {group.fields.map((f) => {
              const id = `setting-${f.key}`;
              const error = errors[f.key] || undefined;
              const props = {
                id,
                value: values[f.key] ?? "",
                "aria-invalid": Boolean(error),
                onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                  setValues((v) => ({ ...v, [f.key]: e.target.value }));
                  if (error) setErrors((x) => ({ ...x, [f.key]: "" }));
                },
              };
              return (
                <Field key={f.key} id={id} label={f.label} hint={f.hint} error={error} className={f.half ? "" : "sm:col-span-2"}>
                  {f.rows ? <Textarea {...props} rows={f.rows} /> : <Input {...props} type={f.type ?? "text"} />}
                </Field>
              );
            })}
          </div>
        </fieldset>
      ))}
      <div className="sticky bottom-0 -mx-4 flex justify-end border-t border-line bg-paper/95 px-4 py-4 backdrop-blur md:-mx-8 md:px-8">
        <Button type="submit" variant="navy" size="lg" disabled={pending || readOnly}>{pending ? "Saving…" : "Save settings"}</Button>
      </div>
    </form>
  );
}

export function SpreadsheetSetup({ disabled }: { disabled: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const run = (starter: boolean) =>
    startTransition(async () => {
      const result = await setupSpreadsheet(starter);
      if (result.ok) toast.success(result.message, { duration: 8000 });
      else toast.error(result.error);
      router.refresh();
    });
  return (
    <section className="rounded-xl border border-line bg-white p-6 shadow-card">
      <h2 className="text-lg font-semibold">Spreadsheet set-up</h2>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        Run this once after connecting the “Jain Classes CMS” Google Sheet. It creates any missing tabs and column headings. Existing rows are never changed or removed. Starter content (courses, subjects and sample topics) is added only to tabs that are empty.
      </p>
      <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
        <Button variant="navy" onClick={() => run(true)} disabled={pending || disabled}>{pending ? "Working…" : "Set up with starter content"}</Button>
        <Button variant="outline" onClick={() => run(false)} disabled={pending || disabled}>Create tabs and columns only</Button>
      </div>
    </section>
  );
}
