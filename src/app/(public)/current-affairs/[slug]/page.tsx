import { CalendarDays, ChevronRight, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RichText } from "@/components/shared/section";
import { Badge } from "@/components/ui/form";
import { getSiteContent } from "@/lib/cms/data";
import { siteUrl } from "@/lib/site";
import { formatDate, splitLines } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { currentAffairs } = await getSiteContent();
  return currentAffairs.slice(0, 50).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { currentAffairs } = await getSiteContent();
  const article = currentAffairs.find((a) => a.slug === slug);
  if (!article) return { title: "Article not found" };
  return {
    title: article.title,
    description: article.summary.slice(0, 155),
    alternates: { canonical: `/current-affairs/${article.slug}` },
    openGraph: { type: "article", title: article.title, description: article.summary, publishedTime: article.published_at || undefined },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const { currentAffairs, settings } = await getSiteContent();
  const article = currentAffairs.find((a) => a.slug === slug);
  if (!article) notFound();

  const sources = splitLines(article.source_urls).filter((u) => /^https?:\/\//.test(u));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary,
    datePublished: article.published_at || article.created_at,
    dateModified: article.updated_at || article.published_at,
    author: { "@type": "Organization", name: settings.institute_name },
    publisher: { "@type": "Organization", name: settings.institute_name },
    mainEntityOfPage: `${siteUrl()}/current-affairs/${article.slug}`,
  };

  return (
    <article className="section-y pt-10 md:pt-14">
      <div className="container-page max-w-3xl">
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-sm text-muted">
          <Link href="/current-affairs" className="hover:text-navy hover:underline">Current Affairs</Link>
          <ChevronRight className="size-4" aria-hidden="true" />
          <span className="text-navy">{article.category}</span>
        </nav>
        <div className="flex flex-wrap gap-2">
          <Badge tone="saffron">{article.category}</Badge>
          {article.relevant_exam ? <Badge>Relevant for: {article.relevant_exam}</Badge> : null}
        </div>
        <h1 className="mt-4 text-3xl font-bold leading-tight md:text-[2.6rem]">{article.title}</h1>
        <p className="mt-4 flex items-center gap-2 text-sm text-muted">
          <CalendarDays className="size-4" aria-hidden="true" />
          <time dateTime={article.published_at}>{formatDate(article.published_at)}</time>
          <span aria-hidden="true">·</span> {settings.institute_name}
        </p>
        <p className="mt-6 border-l-4 border-saffron pl-5 text-lg text-ink/90">{article.summary}</p>
        <RichText text={article.content} className="mt-8 text-[1.05rem] text-ink" />
        {sources.length > 0 ? (
          <aside className="mt-10 rounded-xl border border-line bg-white p-6">
            <h2 className="text-lg font-semibold">Sources</h2>
            <ul className="mt-3 space-y-2 text-[0.95rem]">
              {sources.map((u) => (
                <li key={u}>
                  <a href={u} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-start gap-2 text-navy underline underline-offset-4 [overflow-wrap:anywhere]">
                    <ExternalLink className="mt-1 size-4 shrink-0" aria-hidden="true" /> {u}
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}
        <Link href="/current-affairs" className="mt-10 inline-block font-semibold text-navy hover:underline">← All current affairs</Link>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </article>
  );
}
