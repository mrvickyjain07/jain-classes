import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getSiteContent } from "@/lib/cms/data";
import { imagePath, siteUrl, socialLinks } from "@/lib/site";
import { contextualMessage } from "@/lib/whatsapp";

export const revalidate = 300;

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const content = await getSiteContent();
  const { settings } = content;
  const logo = imagePath(settings.logo_path, "/images/jain-classes-logo.png");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: settings.institute_name,
    url: siteUrl(),
    logo: `${siteUrl()}${logo}`,
    slogan: settings.tagline,
    email: settings.email,
    telephone: `+91${settings.phone.replace(/\D/g, "").slice(-10)}`,
    areaServed: "Maharashtra, India",
    sameAs: socialLinks(settings).map((s) => s.href),
  };

  return (
    <>
      <SiteHeader
        name={settings.institute_name}
        tagline={settings.tagline}
        logo={logo}
        whatsapp={settings.whatsapp_number}
        message={contextualMessage({ type: "general" }, settings.institute_name)}
      />
      <main id="main">{children}</main>
      <SiteFooter content={content} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
