import type { Metadata } from "next";
import { BackendNotice, LoadError } from "@/components/admin/notices";
import { ResourceManager } from "@/components/admin/resource-manager";
import { AdminPageHeader } from "@/components/admin/shell";
import { requireAdmin } from "@/lib/auth";
import { loadAdmin } from "@/lib/cms/admin";

export const metadata: Metadata = { title: "Current Affairs" };

export default async function Page() {
  await requireAdmin();
  const result = await loadAdmin();
  return (
    <>
      <AdminPageHeader title="Current Affairs" description="Write and publish exam-relevant updates. Always write in your own words and add the source links." />
      <BackendNotice backend={result.backend} />
      {result.ok ? (
        <ResourceManager
          entity="current-affairs"
          rows={result.data.currentAffairs}
          refs={{ courses: result.data.courses, subjects: result.data.subjects, topics: result.data.topics }}
          readOnly={result.backend === "seed"}
        />
      ) : (
        <LoadError message={result.message} />
      )}
    </>
  );
}
