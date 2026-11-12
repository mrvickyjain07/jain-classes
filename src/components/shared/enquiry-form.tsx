"use client";

import { useState } from "react";
import { WhatsAppIcon } from "@/components/shared/whatsapp";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { enquirySchema, fieldErrors } from "@/lib/validation";
import { enquiryMessage, whatsappUrl } from "@/lib/whatsapp";

type Option = { title: string; category: string };

export function EnquiryForm({
  whatsapp,
  institute,
  courses,
  defaultCourse = "",
}: {
  whatsapp: string;
  institute: string;
  courses: Option[];
  defaultCourse?: string;
}) {
  const exams = Array.from(new Set(courses.map((c) => c.category)));
  const initialExam = courses.find((c) => c.title === defaultCourse)?.category ?? "";
  const [values, setValues] = useState({ name: "", mobile: "", exam: initialExam, course: defaultCourse, message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [opened, setOpened] = useState<string | null>(null);

  const set = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value, ...(key === "exam" ? { course: "" } : {}) }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
    setOpened(null);
  };

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = enquirySchema.safeParse(values);
    if (!parsed.success) {
      const next = fieldErrors(parsed.error);
      setErrors(next);
      const first = Object.keys(next)[0];
      document.getElementById(`enquiry-${first}`)?.focus();
      return;
    }
    const url = whatsappUrl(whatsapp, enquiryMessage(parsed.data, institute));
    setOpened(url);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  const courseOptions = courses.filter((c) => !values.exam || c.category === values.exam);
  const aria = (key: string) => ({
    "aria-invalid": Boolean(errors[key]),
    "aria-describedby": errors[key] ? `enquiry-${key}-error` : undefined,
  });

  return (
    <form onSubmit={submit} noValidate className="grid gap-5 sm:grid-cols-2">
      <Field id="enquiry-name" label="Student Name" required error={errors.name}>
        <Input id="enquiry-name" name="name" autoComplete="name" value={values.name} onChange={set("name")} maxLength={80} {...aria("name")} />
      </Field>
      <Field id="enquiry-mobile" label="Mobile Number" required error={errors.mobile} hint="10-digit Indian mobile number">
        <Input id="enquiry-mobile" name="mobile" type="tel" inputMode="tel" autoComplete="tel-national" value={values.mobile} onChange={set("mobile")} maxLength={16} {...aria("mobile")} />
      </Field>
      <Field id="enquiry-exam" label="Interested Examination" required error={errors.exam}>
        <Select id="enquiry-exam" name="exam" value={values.exam} onChange={set("exam")} {...aria("exam")}>
          <option value="">Select examination</option>
          {exams.map((x) => <option key={x} value={x}>{x}</option>)}
        </Select>
      </Field>
      <Field id="enquiry-course" label="Interested Course" error={errors.course}>
        <Select id="enquiry-course" name="course" value={values.course} onChange={set("course")}>
          <option value="">Not decided yet</option>
          {courseOptions.map((c) => <option key={c.title} value={c.title}>{c.title}</option>)}
        </Select>
      </Field>
      <Field id="enquiry-message" label="Message" error={errors.message} className="sm:col-span-2" hint={`${values.message.length}/500`}>
        <Textarea id="enquiry-message" name="message" value={values.message} onChange={set("message")} maxLength={500} rows={4} {...aria("message")} />
      </Field>
      <div className="sm:col-span-2">
        <Button type="submit" variant="navy" size="lg" className="w-full sm:w-auto">
          <WhatsAppIcon /> Continue to WhatsApp
        </Button>
        <p className="mt-3 text-sm text-muted">
          This opens WhatsApp with your details filled in. Your enquiry reaches us only after you press <strong className="text-ink">Send</strong> in WhatsApp. Nothing is stored on this website.
        </p>
        <div aria-live="polite">
          {opened ? (
            <p className="mt-3 rounded-lg border border-success/30 bg-success/[0.06] px-4 py-3 text-sm text-ink">
              WhatsApp should have opened in a new tab. Press Send there to complete your enquiry.{" "}
              <a href={opened} target="_blank" rel="noopener noreferrer" className="font-semibold text-navy underline">Open WhatsApp again</a>
            </p>
          ) : null}
        </div>
      </div>
    </form>
  );
}
