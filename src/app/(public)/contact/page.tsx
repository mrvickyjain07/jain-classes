import { Mail, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { EnquiryForm } from "@/components/shared/enquiry-form";
import { PageHero } from "@/components/shared/section";
import { WhatsAppIcon } from "@/components/shared/whatsapp";
import { getSiteContent } from "@/lib/cms/data";
import { imagePath, socialLinks } from "@/lib/site";
import { contextualMessage, whatsappUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact Jain Classes and Prof. Madhusudan Jain by phone, WhatsApp or email for UPSC and MPSC course enquiries and guidance.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ course?: string }> }) {
  const { settings, courses } = await getSiteContent();
  const { course } = await searchParams;
  const selected = courses.find((c) => c.slug === course)?.title ?? "";
  const tel = `+91${settings.phone.replace(/\D/g, "").slice(-10)}`;
  const socials = socialLinks(settings);

  const items = [
    { icon: Phone, label: "Phone", value: settings.phone, href: `tel:${tel}` },
    { icon: WhatsAppIcon, label: "WhatsApp", value: `+${settings.whatsapp_number.replace(/\D/g, "").replace(/^(\d{2})(\d{5})(\d{5})$/, "$1 $2 $3")}`, href: whatsappUrl(settings.whatsapp_number, contextualMessage({ type: "general" }, settings.institute_name)), external: true },
    { icon: Mail, label: "Email", value: settings.email, href: `mailto:${settings.email}` },
  ];

  return (
    <>
      <PageHero eyebrow="Contact" title={`Contact ${settings.institute_name}`} description="Call, email or send a WhatsApp message. We are happy to guide you on courses and preparation." />
      <section className="section-y pt-10 md:pt-12">
        <div className="container-page grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
          <div className="space-y-5">
            <div className="rounded-xl bg-navy p-7 text-white">
              <div className="flex items-center gap-4">
                <Image src={imagePath(settings.logo_path, "/images/jain-classes-logo.png")} alt="" width={64} height={64} className="size-16 rounded-full bg-white" />
                <div>
                  <p className="font-heading text-xl font-bold">{settings.institute_name}</p>
                  <p className="text-white/80">{settings.professor_name}</p>
                  <p lang="mr" className="font-marathi text-sm font-semibold text-gold">{settings.tagline}</p>
                </div>
              </div>
              <ul className="mt-7 space-y-5">
                {items.map((item) => (
                  <li key={item.label}>
                    <a href={item.href} {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="group flex items-center gap-4">
                      <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-white/10 text-gold"><item.icon className="size-5" aria-hidden="true" /></span>
                      <span className="min-w-0">
                        <span className="block text-sm text-white/70">{item.label}</span>
                        <span className="block break-all font-semibold group-hover:underline">{item.value}</span>
                      </span>
                    </a>
                  </li>
                ))}
                {settings.location ? (
                  <li className="flex items-center gap-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-white/10 text-gold"><MapPin className="size-5" aria-hidden="true" /></span>
                    <span><span className="block text-sm text-white/70">Location</span><span className="block font-semibold">{settings.location}</span></span>
                  </li>
                ) : null}
              </ul>
            </div>
            {socials.length > 0 ? (
              <div className="rounded-xl border border-line bg-white p-6">
                <h2 className="text-lg font-semibold">Follow {settings.institute_name}</h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {socials.map((s) => (
                    <li key={s.label}>
                      <a href={s.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center rounded-full border border-navy/20 px-4 text-sm font-semibold text-navy hover:border-navy">{s.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
          <div className="rounded-xl border border-line bg-white p-6 shadow-card md:p-8">
            <h2 className="text-2xl font-semibold">Student enquiry</h2>
            <p className="mb-6 mt-2 text-muted">Fill in your details and continue to WhatsApp to send your enquiry.</p>
            <EnquiryForm
              whatsapp={settings.whatsapp_number}
              institute={settings.institute_name}
              courses={courses.map((c) => ({ title: c.title, category: c.category }))}
              defaultCourse={selected}
            />
          </div>
        </div>
      </section>
    </>
  );
}
