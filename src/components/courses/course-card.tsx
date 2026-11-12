import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { WhatsAppLink } from "@/components/shared/whatsapp";
import { Badge } from "@/components/ui/form";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { contextualMessage } from "@/lib/whatsapp";
import type { PublicCourse } from "@/types/cms";

export function CourseCard({ course, whatsapp, institute }: { course: PublicCourse; whatsapp: string; institute: string }) {
  const subjects = course.subjects.slice(0, 5);
  return (
    <article className="flex h-full flex-col rounded-xl border border-line bg-white p-6 shadow-card">
      <Badge tone="saffron" className="self-start">{course.category}</Badge>
      <h3 className="mt-4 text-xl font-semibold">
        <Link href={`/courses/${course.slug}`} className="hover:text-navy-2 hover:underline decoration-saffron underline-offset-4">{course.title}</Link>
      </h3>
      {course.description ? <p className="mt-2 line-clamp-3 text-[0.95rem] text-muted">{course.description}</p> : null}
      {subjects.length > 0 ? (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Subjects</p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {subjects.map((s) => (
              <li key={s.id}><Badge>{s.title}</Badge></li>
            ))}
            {course.subjects.length > subjects.length ? <li><Badge>+{course.subjects.length - subjects.length} more</Badge></li> : null}
          </ul>
        </div>
      ) : null}
      <div className="mt-auto flex flex-wrap gap-2.5 pt-6">
        <Link href={`/courses/${course.slug}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "min-h-10 flex-1")}>
          View Details <ArrowRight aria-hidden="true" />
          <span className="sr-only"> for {course.title}</span>
        </Link>
        <WhatsAppLink number={whatsapp} message={contextualMessage({ type: "course", course: course.title }, institute)} size="sm" className="min-h-10 flex-1">
          Enquire
        </WhatsAppLink>
      </div>
    </article>
  );
}
