import type { Metadata } from "next";
import { LegalPage } from "@/components/shared/legal";
import { getSiteContent } from "@/lib/cms/data";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "Terms for using the Jain Classes website and its free study materials.",
  alternates: { canonical: "/terms-and-conditions" },
};

export default async function TermsPage() {
  const { settings } = await getSiteContent();
  const name = settings.institute_name;
  return (
    <LegalPage title="Terms and Conditions" updated="November 2026">
      <p>By using the {name} website you agree to these terms.</p>
      <h2>Free educational use</h2>
      <p>The study materials and current affairs on this website are provided free of charge for personal study. You may read, download and share them with fellow students for non-commercial educational purposes.</p>
      <ul>
        <li>Please do not sell the materials or present them as your own work.</li>
        <li>Please do not remove the {name} name from any document.</li>
      </ul>
      <h2>Accuracy of information</h2>
      <p>We try to keep all content accurate and up to date, but we cannot guarantee that it is free from errors. Examination patterns, syllabi, dates and notifications are decided by the examining bodies such as UPSC and MPSC. Always confirm such details from the official notifications.</p>
      <h2>No guarantee of results</h2>
      <p>The website offers educational resources and guidance. It does not guarantee selection, ranks or results in any examination.</p>
      <h2>Third-party services</h2>
      <p>Documents are hosted on Google Drive and enquiries are sent through WhatsApp. Availability of those services, including document previews and downloads, depends on their providers.</p>
      <h2>Changes</h2>
      <p>We may add, change or remove content on this website, and update these terms, at any time.</p>
      <h2>Contact</h2>
      <p>Questions about these terms can be sent to <a href={`mailto:${settings.email}`}>{settings.email}</a>.</p>
    </LegalPage>
  );
}
