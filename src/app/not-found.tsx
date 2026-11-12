import Link from "next/link";

export default function RootNotFound() {
  return (
    <main className="grid min-h-dvh place-items-center p-6 text-center">
      <div>
        <h1 className="text-3xl font-bold">Page not found</h1>
        <Link href="/" className="mt-4 inline-block font-semibold text-navy underline">Go to the Jain Classes homepage</Link>
      </div>
    </main>
  );
}
