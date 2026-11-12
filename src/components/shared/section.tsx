import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  as: Tag = "h2",
  className,
  invert,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  as?: "h1" | "h2";
  className?: string;
  invert?: boolean;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow ? (
        <p className={cn("mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-saffron-dark", align === "center" && "justify-center", invert && "text-gold")}>
          <span aria-hidden="true" className={cn("h-px w-8 bg-saffron", invert && "bg-gold")} />
          {eyebrow}
        </p>
      ) : null}
      <Tag className={cn(Tag === "h1" ? "text-4xl md:text-5xl" : "text-3xl md:text-[2.5rem]", "font-bold leading-tight", invert && "text-white")}>
        {title}
      </Tag>
      {description ? (
        <p className={cn("mt-4 text-lg leading-relaxed text-muted", invert && "text-white/80")}>{description}</p>
      ) : null}
    </div>
  );
}

export function PageHero({ eyebrow, title, description, children }: { eyebrow?: string; title: string; description?: string; children?: React.ReactNode }) {
  return (
    <section className="border-b border-line bg-white">
      <div className="container-page py-12 md:py-16">
        <SectionHeading as="h1" eyebrow={eyebrow} title={title} description={description} className="max-w-3xl" />
        {children}
      </div>
    </section>
  );
}

/**
 * Renders administrator-written text safely (no HTML is ever injected):
 * blank line = new paragraph, "## " = heading, "- " = bullet point.
 */
export function RichText({ text, className }: { text: string; className?: string }) {
  const blocks = text.replace(/\r/g, "").split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className={cn("space-y-4 leading-relaxed", className)}>
      {blocks.map((block, i) => {
        const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
        if (lines.length === 1 && /^#{1,3}\s+/.test(lines[0])) {
          return <h3 key={i} className="pt-2 text-xl font-semibold">{lines[0].replace(/^#{1,3}\s+/, "")}</h3>;
        }
        if (lines.every((l) => /^[-*•]\s+/.test(l))) {
          return (
            <ul key={i} className="list-disc space-y-1.5 pl-5 marker:text-saffron">
              {lines.map((l, j) => <li key={j}>{l.replace(/^[-*•]\s+/, "")}</li>)}
            </ul>
          );
        }
        return (
          <p key={i}>
            {lines.map((l, j) => (
              <span key={j}>{l}{j < lines.length - 1 ? <br /> : null}</span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-navy/20 bg-white px-6 py-12 text-center">
      <p className="font-heading text-lg font-semibold text-navy">{title}</p>
      {children ? <div className="mx-auto mt-2 max-w-md text-muted">{children}</div> : null}
    </div>
  );
}
