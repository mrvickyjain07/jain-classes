import { TriangleAlert } from "lucide-react";
import Link from "next/link";
import type { Backend } from "@/lib/cms/store";

export function LoadError({ message }: { message: string }) {
  return (
    <div role="alert" className="rounded-xl border border-danger/30 bg-white p-7">
      <h2 className="flex items-center gap-2 text-xl font-semibold"><TriangleAlert className="size-5 text-danger" aria-hidden="true" /> Content could not be loaded</h2>
      <p className="mt-2 text-ink/85">{message}</p>
      <p className="mt-4 text-sm text-muted">
        If you have just connected Google Sheets, open <Link href="/admin/dashboard/settings" className="font-semibold text-navy underline">Website Settings</Link> and run the spreadsheet set-up.
      </p>
    </div>
  );
}

export function BackendNotice({ backend }: { backend: Backend }) {
  if (backend === "sheets") return null;
  return (
    <div role="status" className="mb-6 rounded-xl border border-saffron/40 bg-saffron/10 px-5 py-4 text-[0.95rem] text-ink">
      {backend === "local" ? (
        <><strong>Development mode.</strong> Google Sheets is not connected, so content is saved to a local file (<code>.data/cms.json</code>) on this computer only.</>
      ) : (
        <><strong>Google Sheets is not connected.</strong> The website is showing starter content and changes cannot be saved. Add the three Google environment variables in Vercel and redeploy (see the README).</>
      )}
    </div>
  );
}
