export default function Loading() {
  return (
    <div role="status" aria-label="Loading" className="space-y-4">
      <div className="h-9 w-56 animate-pulse rounded-lg bg-navy/10" />
      <div className="h-5 w-80 max-w-full animate-pulse rounded bg-navy/10" />
      <div className="h-64 animate-pulse rounded-xl bg-navy/[0.06]" />
    </div>
  );
}
