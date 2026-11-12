"use client";

import { Button } from "@/components/ui/button";

export default function PublicError({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="section-y">
      <div className="container-page max-w-xl text-center">
        <h1 className="text-3xl font-bold">This page could not be loaded</h1>
        <p className="mt-3 text-muted">Our content service is temporarily unavailable. Please try again in a minute.</p>
        <Button onClick={reset} className="mt-8">Try again</Button>
      </div>
    </section>
  );
}
