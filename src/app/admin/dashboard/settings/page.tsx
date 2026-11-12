import type { Metadata } from "next";
import { BackendNotice, LoadError } from "@/components/admin/notices";
import { SettingsForm, SpreadsheetSetup } from "@/components/admin/settings-form";
import { AdminPageHeader } from "@/components/admin/shell";
import { requireAdmin } from "@/lib/auth";
import { loadAdmin } from "@/lib/cms/admin";

export const metadata: Metadata = { title: "Website Settings" };

export default async function SettingsPage() {
  await requireAdmin();
  const result = await loadAdmin();
  return (
    <>
      <AdminPageHeader title="Website Settings" description="Contact details, homepage text, About section and social links. Changes appear on the website immediately after saving." />
      <BackendNotice backend={result.backend} />
      <div className="space-y-6">
        <SpreadsheetSetup disabled={result.backend === "seed"} />
        {result.ok ? <SettingsForm initial={result.data.settings} readOnly={result.backend === "seed"} /> : <LoadError message={result.message} />}
      </div>
    </>
  );
}
