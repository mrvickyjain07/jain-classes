"use client";

import { CalendarDays } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EmptyState } from "@/components/shared/section";
import { Badge } from "@/components/ui/form";
import { cn, formatDate } from "@/lib/utils";
import type { CurrentAffair } from "@/types/cms";

type Item = Pick<CurrentAffair, "id" | "title" | "slug" | "summary" | "category" | "relevant_exam" | "published_at">;

export function CurrentAffairsList({ articles, categories }: { articles: Item[]; categories: string[] }) {
  const [category, setCategory] = useState("");
  const shown = category ? articles.filter((a) => a.category === category) : articles;
  return (
    <div>
      <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
        {["", ...categories].map((c) => (
          <button
            key={c || "all"}
            type="button"
            aria-pressed={category === c}
            onClick={() => setCategory(c)}
            className={cn(
              "min-h-10 rounded-full border px-4 text-sm font-semibold transition-colors",
              category === c ? "border-navy bg-navy text-white" : "border-navy/20 bg-white text-navy hover:border-navy",
            )}
          >
            {c || "All"}
          </button>
        ))}
      </div>
      <div className="mt-8" aria-live="polite">
        {shown.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {shown.map((a) => (
              <article key={a.id} className="flex flex-col rounded-xl border border-line bg-white p-6 shadow-card">
                <div className="flex flex-wrap gap-2">
                  <Badge tone="saffron">{a.category}</Badge>
                  {a.relevant_exam ? <Badge>{a.relevant_exam}</Badge> : null}
                </div>
                <h2 className="mt-4 text-lg font-semibold leading-snug">
                  <Link href={`/current-affairs/${a.slug}`} className="hover:underline decoration-saffron underline-offset-4">{a.title}</Link>
                </h2>
                <p className="mt-2 line-clamp-4 text-[0.95rem] text-muted">{a.summary}</p>
                <div className="mt-auto flex items-center justify-between pt-5 text-sm">
                  <span className="flex items-center gap-1.5 text-muted"><CalendarDays className="size-4" aria-hidden="true" />{formatDate(a.published_at)}</span>
                  <Link href={`/current-affairs/${a.slug}`} className="font-semibold text-navy hover:underline">Read More<span className="sr-only">: {a.title}</span></Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title={articles.length === 0 ? "Current affairs will be published here soon" : "No articles in this category yet"}>
            {articles.length === 0 ? "Please check back for exam-relevant updates." : "Choose another category to see more updates."}
          </EmptyState>
        )}
      </div>
    </div>
  );
}
