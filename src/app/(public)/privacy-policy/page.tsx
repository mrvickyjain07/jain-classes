import type { Metadata } from "next";
import { LegalPage } from "@/components/shared/legal";
import { getSiteContent } from "@/lib/cms/data";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How the Jain Classes website handles your information.",
  alternates: { canonical: "/privacy-policy" },
};

export default async function PrivacyPolicyPage() {
  const { settings } = await getSiteContent();
  const name = settings.institute_name;
  return (
    <LegalPage title="Privacy Policy" updated="November 2026">
      <p>This policy explains how the {name} website handles information. The website is designed so that students can use it without sharing personal data.</p>
      <h2>No student accounts</h2>
      <p>You do not need to register, log in or pay to use this website. We do not create student accounts and we do not ask for passwords.</p>
      <h2>Enquiry form and WhatsApp</h2>
      <p>The enquiry form does not save your details on this website. It only prepares a message and opens WhatsApp on your device. Your name, mobile number and message reach {name} only if you press Send in WhatsApp. Messages you send are then handled on WhatsApp, under WhatsApp&apos;s own privacy policy, and are used by {name} only to reply to your enquiry.</p>
      <h2>Study materials on Google Drive</h2>
      <p>Study materials are stored on Google Drive. When you view or download a document, it is delivered by Google, and Google may process technical information such as your IP address under its own privacy policy.</p>
      <h2>Technical information</h2>
      <p>Like most websites, our hosting provider may keep standard server logs (for example IP address, browser type and pages requested) to keep the website secure and reliable. The website does not use advertising trackers. The only cookie we set is a login cookie for the institute administrator.</p>
      <h2>Links to other websites</h2>
      <p>Current affairs articles may link to external sources. We are not responsible for the content or privacy practices of those websites.</p>
      <h2>Contact</h2>
      <p>For any question about this policy, write to <a href={`mailto:${settings.email}`}>{settings.email}</a> or call {settings.phone}.</p>
      <p>We may update this policy when the website changes. The latest version will always be available on this page.</p>
    </LegalPage>
  );
}
