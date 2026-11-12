"use client";

import { Button } from "@/components/ui/button";

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded-xl border border-danger/30 bg-white p-8">
      <h1 className="text-2xl font-bold">The content could not be loaded</h1>
      <p className="mt-2 text-muted">
        {process.env.NODE_ENV === "development" ? error.message : "Google Sheets did not respond or is not set up correctly. Check that the spreadsheet is shared with the service account, then try again."}
      </p>
      <Button onClick={reset} variant="navy" className="mt-6">Try again</Button>
    </div>
  );
}
