"use client";

import { LogIn } from "lucide-react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { loginAction, type LoginState } from "@/lib/auth/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});
  return (
    <form action={action} className="space-y-5">
      <Field id="email" label="Admin email" required>
        <Input id="email" name="email" type="email" autoComplete="username" required maxLength={200} />
      </Field>
      <Field id="password" label="Password" required>
        <Input id="password" name="password" type="password" autoComplete="current-password" required maxLength={200} />
      </Field>
      <div aria-live="assertive">
        {state.error ? (
          <p role="alert" className="rounded-lg border border-danger/30 bg-danger/[0.06] px-4 py-3 text-sm font-medium text-danger">{state.error}</p>
        ) : null}
      </div>
      <Button type="submit" variant="navy" size="lg" className="w-full" disabled={pending}>
        <LogIn aria-hidden="true" /> {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
