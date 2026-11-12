import type { Metadata } from "next";
import { CurrentAffairsList } from "@/components/shared/current-affairs-list";
import { PageHero } from "@/components/shared/section";
import { getSiteContent } from "@/lib/cms/data";
import { CURRENT_AFFAIRS_CATEGORIES } from "@/lib/cms/schema";

export const metadata: Metadata = {
  title: "Current Affairs for UPSC and MPSC",
  description: "Exam-relevant current affairs from Jain Classes: national news, Maharashtra news, government schemes, economy, science and technology, and international affairs.",
  alternates: { canonical: "/current-affairs" },
};

export default async function CurrentAffairsPage() {
  const { currentAffairs } = await getSiteContent();
  const items = currentAffairs.map(({ id, title, slug, summary, category, relevant_exam, published_at }) => ({ id, title, slug, summary, category, relevant_exam, published_at }));
  return (
    <>
      <PageHero eyebrow="Current affairs" title="Current affairs for competitive examinations" description="Short, exam-focused updates prepared by Jain Classes, with links to the original sources." />
      <section className="section-y pt-10 md:pt-12">
        <div className="container-page">
          <CurrentAffairsList articles={items} categories={[...CURRENT_AFFAIRS_CATEGORIES]} />
        </div>
      </section>
    </>
  );
}
