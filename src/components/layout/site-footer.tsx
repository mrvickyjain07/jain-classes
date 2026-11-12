import { Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { WhatsAppIcon } from "@/components/shared/whatsapp";
import { imagePath, NAV_LINKS, socialLinks } from "@/lib/site";
import { contextualMessage, whatsappUrl } from "@/lib/whatsapp";
import type { SiteContent } from "@/types/cms";

export function SiteFooter({ content }: { content: SiteContent }) {
  const { settings, courses } = content;
  const socials = socialLinks(settings);
  const heading = "mb-4 font-heading text-sm font-semibold uppercase tracking-[0.12em] text-gold";
  const link = "text-white/80 transition-colors hover:text-white";

  return (
    <footer className="bg-navy text-white">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <div className="flex items-center gap-3">
            <Image src={imagePath(settings.logo_path, "/images/jain-classes-logo.png")} alt="" width={56} height={56} className="size-14 rounded-full bg-white" />
            <div>
              <p className="font-heading text-xl font-bold">{settings.institute_name}</p>
              <p lang="mr" className="font-marathi text-sm font-semibold text-gold">{settings.tagline}</p>
            </div>
          </div>
          <p className="mt-5 max-w-sm text-[0.95rem] leading-relaxed text-white/75">
            Guidance and free study resources for UPSC, MPSC and other Maharashtra competitive examinations.
          </p>
          <p className="mt-4 text-sm text-white/75">{settings.professor_name}</p>
        </div>

        <nav aria-label="Footer">
          <h2 className={heading}>Explore</h2>
          <ul className="space-y-2.5 text-[0.95rem]">
            {NAV_LINKS.map((l) => (
              <li key={l.href}><Link href={l.href} className={link}>{l.label}</Link></li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Courses">
          <h2 className={heading}>Courses</h2>
          <ul className="space-y-2.5 text-[0.95rem]">
            {courses.map((c) => (
              <li key={c.id}><Link href={`/courses/${c.slug}`} className={link}>{c.title}</Link></li>
            ))}
            <li><Link href="/study-materials" className={link}>Free Study Materials</Link></li>
          </ul>
        </nav>

        <div>
          <h2 className={heading}>Contact</h2>
          <ul className="space-y-3 text-[0.95rem]">
            <li>
              <a href={`tel:+91${settings.phone.replace(/\D/g, "").slice(-10)}`} className={`${link} flex items-center gap-2.5`}>
                <Phone className="size-4 shrink-0 text-gold" aria-hidden="true" /> {settings.phone}
              </a>
            </li>
            <li>
              <a href={whatsappUrl(settings.whatsapp_number, contextualMessage({ type: "general" }, settings.institute_name))} target="_blank" rel="noopener noreferrer" className={`${link} flex items-center gap-2.5`}>
                <WhatsAppIcon className="size-4 shrink-0 text-gold" /> WhatsApp enquiry
              </a>
            </li>
            <li>
              <a href={`mailto:${settings.email}`} className={`${link} flex items-center gap-2.5 break-all`}>
                <Mail className="size-4 shrink-0 text-gold" aria-hidden="true" /> {settings.email}
              </a>
            </li>
            {settings.location ? (
              <li className="flex items-center gap-2.5 text-white/80">
                <MapPin className="size-4 shrink-0 text-gold" aria-hidden="true" /> {settings.location}
              </li>
            ) : null}
          </ul>
          {socials.length > 0 ? (
            <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="font-medium text-white underline decoration-gold/60 underline-offset-4 hover:decoration-gold">{s.label}</a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-3 py-5 text-sm text-white/70 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {settings.institute_name}. All rights reserved.</p>
          <ul className="flex gap-5">
            <li><Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link></li>
            <li><Link href="/terms-and-conditions" className="hover:text-white">Terms and Conditions</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
