import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/shared/section";
import { MaterialsExplorer } from "@/components/study-materials/explorer";
import { Badge } from "@/components/ui/form";
import { getSiteContent } from "@/lib/cms/data";

export const metadata: Metadata = {
  title: "Free Study Materials for UPSC and MPSC",
  description: "Free UPSC and MPSC study materials from Jain Classes. Subject-wise and topic-wise notes for Polity, History, Geography, Economy, Maharashtra GK and more. No login required.",
  alternates: { canonical: "/study-materials" },
};

export default async function StudyMaterialsPage() {
  const { courses, materials } = await getSiteContent();
  return (
    <>
      <PageHero eyebrow="Study materials" title="Free study materials" description="Choose your examination, then a subject and a topic. Every note opens directly, with no registration, login or payment.">
        <ul className="mt-6 flex flex-wrap gap-2">
          <li><Badge tone="success" className="px-3 py-1 text-sm">100% free</Badge></li>
          <li><Badge className="px-3 py-1 text-sm">No login needed</Badge></li>
          <li><Badge className="px-3 py-1 text-sm">Subject-wise and topic-wise</Badge></li>
        </ul>
      </PageHero>
      <section className="section-y pt-10 md:pt-12">
        <div className="container-page">
          <Suspense fallback={<p className="text-muted">Loading study materials…</p>}>
            <MaterialsExplorer courses={courses} materials={materials} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
