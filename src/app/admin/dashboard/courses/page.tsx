import type { Metadata } from "next";
import { BackendNotice, LoadError } from "@/components/admin/notices";
import { ResourceManager } from "@/components/admin/resource-manager";
import { AdminPageHeader } from "@/components/admin/shell";
import { requireAdmin } from "@/lib/auth";
import { loadAdmin } from "@/lib/cms/admin";

export const metadata: Metadata = { title: "Courses" };

export default async function Page() {
  await requireAdmin();
  const result = await loadAdmin();
  return (
    <>
      <AdminPageHeader title="Courses" description="Add, edit, reorder and publish the courses shown on the website." />
      <BackendNotice backend={result.backend} />
      {result.ok ? (
        <ResourceManager
          entity="courses"
          rows={result.data.courses}
          refs={{ courses: result.data.courses, subjects: result.data.subjects, topics: result.data.topics }}
          readOnly={result.backend === "seed"}
        />
      ) : (
        <LoadError message={result.message} />
      )}
    </>
  );
}
