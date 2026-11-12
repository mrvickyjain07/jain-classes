import { Eye, Flag } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand, ProfessorPhoto, WhyChoose } from "@/components/home/sections";
import { PageHero, RichText, SectionHeading } from "@/components/shared/section";
import { WhatsAppLink } from "@/components/shared/whatsapp";
import { buttonVariants } from "@/components/ui/button";
import { getSiteContent } from "@/lib/cms/data";
import { contextualMessage } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "About Us",
  description: "About Jain Classes and Prof. Madhusudan Jain: our vision, mission and teaching approach for UPSC and MPSC aspirants in Maharashtra.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const { settings } = await getSiteContent();
  const name = settings.institute_name;
  return (
    <>
      <PageHero eyebrow="About us" title={`About ${name}`} description={settings.about_intro} />

      <section className="section-y">
        <div className="container-page grid gap-5 md:grid-cols-2">
          {[
            { icon: Eye, title: "Our Vision", text: settings.vision },
            { icon: Flag, title: "Our Mission", text: settings.mission },
          ].map((b) => (
            <div key={b.title} className="rounded-xl border border-line bg-white p-7 shadow-card">
              <span className="grid size-11 place-items-center rounded-lg bg-navy text-gold" aria-hidden="true"><b.icon className="size-5" /></span>
              <h2 className="mt-5 text-2xl font-semibold">{b.title}</h2>
              <RichText text={b.text} className="mt-3 text-ink/90" />
            </div>
          ))}
        </div>
      </section>

      <section className="section-y border-y border-line bg-white">
        <div className="container-page grid items-start gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <ProfessorPhoto settings={settings} priority />
          <div>
            <SectionHeading eyebrow="About the professor" title={settings.professor_name} />
            <RichText text={settings.professor_intro} className="mt-5 text-lg text-ink/90" />
            <RichText text={settings.professor_guidance} className="mt-4 text-ink/90" />
            <h3 className="mt-8 text-xl font-semibold">Teaching philosophy</h3>
            <RichText text={settings.teaching_philosophy} className="mt-2 border-l-4 border-saffron pl-5 text-ink/90" />
            <WhatsAppLink number={settings.whatsapp_number} message={contextualMessage({ type: "professor" }, name)} className="mt-8">
              Connect with Professor
            </WhatsAppLink>
          </div>
        </div>
      </section>

      <section className="section-y">
        <div className="container-page grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading eyebrow="How we teach" title="Educational approach" />
            <RichText text={settings.educational_approach} className="mt-5 text-lg text-ink/90" />
          </div>
          <div className="rounded-xl bg-navy p-8 text-white">
            <h2 className="text-2xl font-semibold text-white">Free educational resources</h2>
            <p className="mt-3 text-white/80">
              Every study material on this website is free and open to all students. You do not need to register, log in or pay. Choose your examination, open a topic and start reading.
            </p>
            <Link href="/study-materials" className={`${buttonVariants()} mt-6`}>Explore Free Study Materials</Link>
          </div>
        </div>
      </section>

      <section className="section-y border-t border-line bg-white">
        <div className="container-page">
          <SectionHeading title={`Why choose ${name}?`} />
          <WhyChoose className="mt-10" />
        </div>
      </section>

      <CtaBand title="Have a question about your preparation?" text="Message us on WhatsApp and we will guide you.">
        <WhatsAppLink number={settings.whatsapp_number} message={contextualMessage({ type: "guidance" }, name)} variant="primary" size="lg" />
      </CtaBand>
    </>
  );
}
