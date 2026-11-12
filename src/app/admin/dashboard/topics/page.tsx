import type { Metadata } from "next";
import { BackendNotice, LoadError } from "@/components/admin/notices";
import { ResourceManager } from "@/components/admin/resource-manager";
import { AdminPageHeader } from "@/components/admin/shell";
import { requireAdmin } from "@/lib/auth";
import { loadAdmin } from "@/lib/cms/admin";

export const metadata: Metadata = { title: "Topics" };

export default async function Page() {
  await requireAdmin();
  const result = await loadAdmin();
  return (
    <>
      <AdminPageHeader title="Topics" description="Topics belong to a subject. Each topic can hold several study notes." />
      <BackendNotice backend={result.backend} />
      {result.ok ? (
        <ResourceManager
          entity="topics"
          rows={result.data.topics}
          refs={{ courses: result.data.courses, subjects: result.data.subjects, topics: result.data.topics }}
          readOnly={result.backend === "seed"}
        />
      ) : (
        <LoadError message={result.message} />
      )}
    </>
  );
}
