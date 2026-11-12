import type { Metadata } from "next";
import { BackendNotice, LoadError } from "@/components/admin/notices";
import { ResourceManager } from "@/components/admin/resource-manager";
import { AdminPageHeader } from "@/components/admin/shell";
import { requireAdmin } from "@/lib/auth";
import { loadAdmin } from "@/lib/cms/admin";

export const metadata: Metadata = { title: "Subjects" };

export default async function Page() {
  await requireAdmin();
  const result = await loadAdmin();
  return (
    <>
      <AdminPageHeader title="Subjects" description="Subjects belong to a course. Unpublishing a subject hides its topics and notes too." />
      <BackendNotice backend={result.backend} />
      {result.ok ? (
        <ResourceManager
          entity="subjects"
          rows={result.data.subjects}
          refs={{ courses: result.data.courses, subjects: result.data.subjects, topics: result.data.topics }}
          readOnly={result.backend === "seed"}
        />
      ) : (
        <LoadError message={result.message} />
      )}
    </>
  );
}
