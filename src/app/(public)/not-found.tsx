import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="section-y">
      <div className="container-page max-w-xl text-center">
        <p className="font-heading text-6xl font-bold text-saffron-dark">404</p>
        <h1 className="mt-4 text-3xl font-bold">Page not found</h1>
        <p className="mt-3 text-muted">The page you are looking for may have been moved or is no longer published.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className={buttonVariants()}>Go to homepage</Link>
          <Link href="/study-materials" className={buttonVariants({ variant: "outline" })}>Free study materials</Link>
        </div>
      </div>
    </section>
  );
}
