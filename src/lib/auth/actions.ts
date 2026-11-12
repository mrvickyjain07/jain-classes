"use server";

import { AuthError } from "next-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { adminConfig, signIn, signOut } from "@/lib/auth";
import { loginBlockedFor, recordLoginFailure, recordLoginSuccess } from "@/lib/auth/rate-limit";
import { loginSchema } from "@/lib/validation";

export type LoginState = { error?: string };

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!adminConfig()) {
    return { error: "Admin login is not set up yet. Add ADMIN_EMAIL, ADMIN_PASSWORD_HASH and AUTH_SECRET (see README)." };
  }
  const ip = await clientIp();
  const wait = loginBlockedFor(ip);
  if (wait > 0) {
    return { error: `Too many failed attempts. Please try again in ${Math.ceil(wait / 60)} minute(s).` };
  }
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    recordLoginFailure(ip);
    return { error: "Incorrect email or password." };
  }
  try {
    await signIn("credentials", { ...parsed.data, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      recordLoginFailure(ip);
      return { error: "Incorrect email or password." };
    }
    throw error;
  }
  recordLoginSuccess(ip);
  redirect("/admin/dashboard");
}

export async function logoutAction() {
  await signOut({ redirectTo: "/admin/login" });
}
