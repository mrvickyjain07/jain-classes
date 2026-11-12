import { PageHero } from "@/components/shared/section";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <>
      <PageHero title={title} description={`Last updated: ${updated}`} />
      <section className="section-y pt-10 md:pt-12">
        <div className="container-page max-w-3xl space-y-4 leading-relaxed text-ink/90 [&_a]:font-semibold [&_a]:text-navy [&_a]:underline [&_h2]:pt-5 [&_h2]:text-2xl [&_h2]:font-semibold [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
          {children}
        </div>
      </section>
    </>
  );
}
