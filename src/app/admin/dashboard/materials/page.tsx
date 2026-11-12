import type { Metadata } from "next";
import { BackendNotice, LoadError } from "@/components/admin/notices";
import { ResourceManager } from "@/components/admin/resource-manager";
import { AdminPageHeader } from "@/components/admin/shell";
import { requireAdmin } from "@/lib/auth";
import { loadAdmin } from "@/lib/cms/admin";

export const metadata: Metadata = { title: "Study Materials" };

export default async function Page() {
  await requireAdmin();
  const result = await loadAdmin();
  return (
    <>
      <AdminPageHeader title="Study Materials" description="Link PDFs and notes from Google Drive. Students can open every published note for free, without logging in." />
      <BackendNotice backend={result.backend} />
      {result.ok ? (
        <ResourceManager
          entity="materials"
          rows={result.data.materials}
          refs={{ courses: result.data.courses, subjects: result.data.subjects, topics: result.data.topics }}
          readOnly={result.backend === "seed"}
        />
      ) : (
        <LoadError message={result.message} />
      )}
    </>
  );
}
