import {
  ArrowRight, BookOpenCheck, ClipboardList, Compass, FileStack, GraduationCap, Lightbulb, Newspaper, Target,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { WhatsAppLink } from "@/components/shared/whatsapp";
import { buttonVariants } from "@/components/ui/button";
import { imagePath } from "@/lib/site";
import { cn } from "@/lib/utils";
import { contextualMessage } from "@/lib/whatsapp";
import type { Settings } from "@/types/cms";

export function ProfessorPhoto({ settings, priority = false, className }: { settings: Settings; priority?: boolean; className?: string }) {
  return (
    <figure className={cn("relative mx-auto w-full max-w-[24rem]", className)}>
      <div aria-hidden="true" className="absolute -right-3 -top-3 h-2/3 w-2/3 rounded-2xl bg-saffron/90 md:-right-4 md:-top-4" />
      <div aria-hidden="true" className="absolute -bottom-3 -left-3 h-2/3 w-2/3 rounded-2xl bg-navy md:-bottom-4 md:-left-4" />
      <div className="relative overflow-hidden rounded-2xl border-4 border-white bg-white shadow-xl">
        <Image
          src={imagePath(settings.professor_image_path, "/images/prof-madhusudan-jain.jpg")}
          alt={`${settings.professor_name}, ${settings.institute_name}`}
          width={1024}
          height={1536}
          priority={priority}
          sizes="(min-width: 1024px) 384px, (min-width: 640px) 60vw, 90vw"
          className="aspect-[4/5] w-full object-cover object-top"
        />
        <figcaption className="border-t-4 border-saffron bg-navy px-5 py-3.5 text-white">
          <span className="block font-heading text-lg font-semibold leading-tight">{settings.professor_name}</span>
          <span className="block text-sm text-white/75">{settings.institute_name}</span>
        </figcaption>
      </div>
    </figure>
  );
}

export function Hero({ settings }: { settings: Settings }) {
  const highlights = ["Concept-Based Learning", "Exam-Oriented Preparation", "Free Study Materials"];
  return (
    <section className="relative overflow-hidden bg-white">
      <div aria-hidden="true" className="absolute inset-y-0 right-0 hidden w-[38%] bg-paper lg:block" />
      <div className="container-page relative grid items-center gap-12 py-12 md:py-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10 lg:py-20">
        <div className="animate-rise">
          <p lang="mr" className="inline-flex items-center gap-3 font-marathi text-lg font-semibold text-saffron-dark">
            <span aria-hidden="true" className="h-px w-8 bg-saffron" />
            {settings.tagline}
          </p>
          <h1 className="mt-4 text-[2.4rem] font-bold leading-[1.12] sm:text-5xl lg:text-[3.4rem]">{settings.hero_headline}</h1>
          <p className="mt-5 inline-block rounded-md bg-navy px-4 py-2 font-heading text-sm font-semibold tracking-wide text-white sm:text-base">
            {settings.hero_subtitle.split("|").map((part, i) => (
              <span key={i}>
                {i > 0 ? <span aria-hidden="true" className="mx-2 text-gold">|</span> : null}
                {part.trim()}
              </span>
            ))}
          </p>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">{settings.hero_description}</p>
          <ul className="mt-6 grid gap-2.5 sm:grid-cols-3">
            {highlights.map((h) => (
              <li key={h} className="flex items-center gap-2 text-[0.93rem] font-medium text-ink">
                <BookOpenCheck className="size-5 shrink-0 text-saffron-dark" aria-hidden="true" /> {h}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/courses" className={buttonVariants({ size: "lg" })}>
              Explore Courses <ArrowRight aria-hidden="true" />
            </Link>
            <WhatsAppLink number={settings.whatsapp_number} message={contextualMessage({ type: "general" }, settings.institute_name)} size="lg" />
          </div>
        </div>
        <ProfessorPhoto settings={settings} priority className="lg:mr-4" />
      </div>
    </section>
  );
}

const REASONS = [
  { icon: Lightbulb, title: "Conceptual Learning", text: "Understand the why behind every topic before memorising facts." },
  { icon: FileStack, title: "Free Educational Resources", text: "All notes on this website are free. No login, no payment." },
  { icon: Newspaper, title: "Current Affairs", text: "Exam-relevant updates on national and Maharashtra affairs." },
  { icon: ClipboardList, title: "Previous Year Questions", text: "Learn the examination pattern through PYQ-based practice." },
  { icon: Target, title: "Mock Tests", text: "Regular practice to build speed, accuracy and confidence." },
  { icon: GraduationCap, title: "Subject-Wise Notes", text: "Notes organised by examination, subject and topic." },
  { icon: Compass, title: "Exam Guidance", text: "Direction on strategy, study plans and preparation approach." },
];

export function WhyChoose({ className }: { className?: string }) {
  return (
    <ul className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {REASONS.map((r, i) => (
        <li key={r.title} className={cn("rounded-xl border border-line bg-white p-5", i === 0 && "lg:col-span-2")}>
          <span className="grid size-11 place-items-center rounded-lg bg-navy text-gold" aria-hidden="true">
            <r.icon className="size-5" />
          </span>
          <h3 className="mt-4 text-lg font-semibold">{r.title}</h3>
          <p className="mt-1.5 text-[0.95rem] text-muted">{r.text}</p>
        </li>
      ))}
    </ul>
  );
}

export function CtaBand({
  title,
  text,
  children,
  tone = "navy",
}: {
  title: string;
  text?: string;
  children: React.ReactNode;
  tone?: "navy" | "saffron";
}) {
  return (
    <section className={cn(tone === "navy" ? "bg-navy text-white" : "bg-saffron text-navy")}>
      <div className="container-page flex flex-col items-start gap-6 py-14 md:flex-row md:items-center md:justify-between md:py-16">
        <div className="max-w-2xl">
          <h2 className={cn("text-2xl font-bold leading-snug md:text-3xl", tone === "navy" ? "text-white" : "text-navy")}>{title}</h2>
          {text ? <p className={cn("mt-3 text-lg", tone === "navy" ? "text-white/80" : "text-navy/85")}>{text}</p> : null}
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">{children}</div>
      </div>
    </section>
  );
}
