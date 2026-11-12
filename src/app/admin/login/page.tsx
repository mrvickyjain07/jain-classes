import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { adminConfig, isAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Admin Login" };

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin/dashboard");
  const configured = adminConfig() !== null;
  return (
    <main className="grid min-h-dvh place-items-center bg-navy px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl sm:p-9">
        <div className="mb-7 flex items-center gap-4">
          <Image src="/images/jain-classes-logo.png" alt="" width={56} height={56} className="size-14 rounded-full" priority />
          <div>
            <h1 className="text-xl font-bold">Jain Classes Admin</h1>
            <p className="text-sm text-muted">For the institute administrator only</p>
          </div>
        </div>
        {configured ? null : (
          <p className="mb-5 rounded-lg border border-saffron/40 bg-saffron/10 px-4 py-3 text-sm text-ink">
            Admin login is not configured yet. Set <code>ADMIN_EMAIL</code>, <code>ADMIN_PASSWORD_HASH</code> and <code>AUTH_SECRET</code> (see the README).
          </p>
        )}
        <LoginForm />
        <p className="mt-6 text-center text-sm text-muted">
          Students do not need to log in. <Link href="/" className="font-semibold text-navy underline">Go to the website</Link>
        </p>
      </div>
    </main>
  );
}
