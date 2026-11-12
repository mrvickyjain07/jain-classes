import * as React from "react";
import { cn } from "@/lib/utils";

const control =
  "w-full rounded-lg border border-navy/20 bg-white px-3.5 text-[0.95rem] text-ink placeholder:text-muted/70 transition-colors focus:border-navy focus:outline-none focus:ring-2 focus:ring-saffron/50 disabled:bg-paper aria-[invalid=true]:border-danger";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(control, "min-h-11", className)} {...props} />;
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(control, "min-h-28 py-2.5 leading-relaxed", className)} {...props} />;
}

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(control, "min-h-11 appearance-auto pr-2", className)} {...props}>
      {children}
    </select>
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-1.5 block text-sm font-semibold text-navy", className)} {...props} />;
}

export function Field({
  id,
  label,
  error,
  hint,
  required,
  children,
  className,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={id}>
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </Label>
      {children}
      {hint && !error ? <p id={`${id}-hint`} className="mt-1.5 text-xs leading-relaxed text-muted">{hint}</p> : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: "neutral" | "success" | "saffron" | "navy" | "danger" }) {
  const tones = {
    neutral: "bg-navy/[0.06] text-navy",
    success: "bg-success/10 text-success",
    saffron: "bg-saffron/15 text-saffron-dark",
    navy: "bg-navy text-white",
    danger: "bg-danger/10 text-danger",
  };
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", tones[tone], className)}
      {...props}
    />
  );
}
