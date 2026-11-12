"use client";

import { BookOpen, ExternalLink, FileText, Layers, LayoutDashboard, ListTree, LogOut, Menu, Newspaper, Settings, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Dialog, DialogClose, DialogDescription, DialogTitle, DialogTrigger, DrawerContent } from "@/components/ui/dialog";
import { logoutAction } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/dashboard/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/dashboard/subjects", label: "Subjects", icon: Layers },
  { href: "/admin/dashboard/topics", label: "Topics", icon: ListTree },
  { href: "/admin/dashboard/materials", label: "Study Materials", icon: FileText },
  { href: "/admin/dashboard/current-affairs", label: "Current Affairs", icon: Newspaper },
  { href: "/admin/dashboard/settings", label: "Website Settings", icon: Settings },
];

function Nav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="flex flex-1 flex-col gap-1 p-3">
      {LINKS.map((l) => {
        const active = l.href === "/admin/dashboard" ? pathname === l.href : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-lg px-3.5 text-[0.95rem] font-medium transition-colors",
              active ? "bg-white/12 text-white" : "text-white/75 hover:bg-white/[0.07] hover:text-white",
            )}
          >
            <l.icon className={cn("size-5", active && "text-gold")} aria-hidden="true" /> {l.label}
          </Link>
        );
      })}
      <div className="mt-auto space-y-1 border-t border-white/10 pt-3">
        <a href="/" target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-3 rounded-lg px-3.5 text-[0.95rem] font-medium text-white/75 hover:bg-white/[0.07] hover:text-white">
          <ExternalLink className="size-5" aria-hidden="true" /> View website
        </a>
        <form action={logoutAction}>
          <button type="submit" className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3.5 text-left text-[0.95rem] font-medium text-white/75 hover:bg-white/[0.07] hover:text-white">
            <LogOut className="size-5" aria-hidden="true" /> Logout
          </button>
        </form>
      </div>
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <Image src="/images/jain-classes-logo.png" alt="" width={40} height={40} className="size-10 rounded-full bg-white" />
      <div className="leading-tight">
        <p className="font-heading font-semibold text-white">Jain Classes</p>
        <p className="text-xs text-white/60">Admin dashboard</p>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-dvh bg-paper lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-navy lg:flex">
        <div className="border-b border-white/10 px-5 py-5"><Brand /></div>
        <Nav />
      </aside>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-navy px-4 lg:hidden">
        <Brand />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="grid size-11 place-items-center rounded-lg text-white hover:bg-white/10" aria-label="Open admin menu">
            <Menu className="size-6" />
          </DialogTrigger>
          <DrawerContent className="bg-navy" aria-describedby="admin-nav-description">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <DialogTitle className="font-heading font-semibold text-white">Menu</DialogTitle>
              <DialogClose className="grid size-10 place-items-center rounded-lg text-white hover:bg-white/10" aria-label="Close menu"><X className="size-6" /></DialogClose>
            </div>
            <DialogDescription id="admin-nav-description" className="sr-only">Admin navigation</DialogDescription>
            <Nav onNavigate={() => setOpen(false)} />
          </DrawerContent>
        </Dialog>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-7 md:px-8 md:py-10">{children}</main>
    </div>
  );
}

export function AdminPageHeader({ title, description, children }: { title: string; description?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
        {description ? <p className="mt-1.5 max-w-2xl text-muted">{description}</p> : null}
      </div>
      {children}
    </div>
  );
}
