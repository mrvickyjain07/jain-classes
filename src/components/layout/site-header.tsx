"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { WhatsAppLink } from "@/components/shared/whatsapp";
import { Dialog, DialogClose, DialogDescription, DialogTitle, DialogTrigger, DrawerContent } from "@/components/ui/dialog";
import { NAV_LINKS } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteHeader({
  name,
  tagline,
  logo,
  whatsapp,
  message,
}: {
  name: string;
  tagline: string;
  logo: string;
  whatsapp: string;
  message: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-navy focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <div className="container-page flex h-[4.5rem] items-center justify-between gap-4">
        <Link href="/" className="flex min-w-0 items-center gap-3" aria-label={`${name} home`}>
          <Image src={logo} alt="" width={52} height={52} priority className="size-12 shrink-0 rounded-full md:size-[3.25rem]" />
          <span className="min-w-0">
            <span className="block truncate font-heading text-lg font-bold leading-tight text-navy md:text-xl">{name}</span>
            <span lang="mr" className="block truncate font-marathi text-xs font-semibold text-saffron-dark md:text-[0.8rem]">{tagline}</span>
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={cn(
                "rounded-md px-3 py-2 text-[0.93rem] font-medium text-ink/80 transition-colors hover:text-navy",
                isActive(link.href) && "font-semibold text-navy underline decoration-saffron decoration-2 underline-offset-[10px]",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <WhatsAppLink number={whatsapp} message={message} size="sm" className="hidden min-h-10 px-4 sm:inline-flex">
            Enquire on WhatsApp
          </WhatsAppLink>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className="grid size-11 place-items-center rounded-lg border border-navy/15 text-navy lg:hidden" aria-label="Open menu">
              <Menu className="size-6" />
            </DialogTrigger>
            <DrawerContent aria-describedby="mobile-nav-description">
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <DialogTitle className="font-heading text-lg font-bold text-navy">{name}</DialogTitle>
                <DialogClose className="grid size-10 place-items-center rounded-lg text-navy hover:bg-navy/[0.06]" aria-label="Close menu">
                  <X className="size-6" />
                </DialogClose>
              </div>
              <DialogDescription id="mobile-nav-description" className="sr-only">Site navigation</DialogDescription>
              <nav aria-label="Mobile" className="flex flex-col p-3">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className={cn(
                      "rounded-lg px-4 py-3.5 text-base font-medium text-ink",
                      isActive(link.href) ? "bg-navy/[0.06] font-semibold text-navy" : "hover:bg-paper",
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto border-t border-line p-5">
                <WhatsAppLink number={whatsapp} message={message} className="w-full" />
                <p lang="mr" className="mt-4 text-center font-marathi text-sm font-semibold text-saffron-dark">{tagline}</p>
              </div>
            </DrawerContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
