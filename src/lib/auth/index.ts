import "server-only";
import { timingSafeEqual } from "node:crypto";
import { argon2Verify } from "hash-wasm";
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { redirect } from "next/navigation";
import { loginSchema } from "@/lib/validation";

/**
 * Administrator authentication (Auth.js, Credentials provider, JWT sessions).
 * There is exactly one account, defined by environment variables. Students
 * never log in; nothing on the public website uses this module.
 */

export function adminConfig() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  let hash = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (!email || !hash || !process.env.AUTH_SECRET) return null;
  // The setup script prints the hash as "b64:..." because "$" characters in an
  // Argon2 hash are mangled by .env variable expansion.
  if (hash.startsWith("b64:")) hash = Buffer.from(hash.slice(4), "base64").toString("utf8");
  if (!hash.startsWith("$argon2id$")) return null;
  return { email, hash };
}

// Verified when the email is wrong, so response time does not reveal which part failed.
const DUMMY_HASH =
  "$argon2id$v=19$m=19456,t=2,p=1$RyXS1G8brN1KA5UP1+2pUA$cdzsjMRuiGgCvhYKQbqf6sCTTNS1m1wd+HUkfsBEteI";

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 8 * 60 * 60, updateAge: 60 * 60 },
  pages: { signIn: "/admin/login", error: "/admin/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const config = adminConfig();
        const parsed = loginSchema.safeParse(credentials);
        if (!config || !parsed.success) throw new CredentialsSignin();
        const emailOk = safeEqual(parsed.data.email.trim().toLowerCase(), config.email);
        const passwordOk = await argon2Verify({
          password: parsed.data.password,
          hash: emailOk ? config.hash : DUMMY_HASH,
        }).catch(() => false);
        if (!emailOk || !passwordOk) throw new CredentialsSignin();
        return { id: "admin", email: config.email, name: "Administrator" };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = "admin";
      return token;
    },
    session({ session, token }) {
      (session.user as { role?: unknown }).role = token.role;
      return session;
    },
  },
});

export async function isAdmin(): Promise<boolean> {
  const config = adminConfig();
  if (!config) return false;
  const session = await auth();
  const user = session?.user as { email?: string | null; role?: unknown } | undefined;
  // The session is only valid for the currently configured admin email.
  return user?.role === "admin" && user.email?.toLowerCase() === config.email;
}

/** For pages: sends anyone who is not the administrator to the login page. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}
