"use client";

import { Download, ExternalLink, Eye, FileText, FolderOpen } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/form";
import { cn, formatDate } from "@/lib/utils";
import type { PublicMaterial } from "@/types/cms";

export function MaterialCard({ material, showPath = false }: { material: PublicMaterial; showPath?: boolean }) {
  const { links } = material;
  const isFolder = material.kind === "folder";
  const Icon = isFolder ? FolderOpen : FileText;
  const date = formatDate(material.created_at || material.updated_at);

  return (
    <article className="flex h-full flex-col rounded-xl border border-line bg-white p-5 shadow-card">
      <div className="flex items-start gap-3.5">
        <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-navy/[0.06] text-navy" aria-hidden="true">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <h3 className="text-base font-semibold leading-snug [overflow-wrap:anywhere]">{material.title}</h3>
          {showPath ? (
            <p className="mt-1 text-sm text-muted [overflow-wrap:anywhere]">
              {material.courseTitle} › {material.subjectTitle} › {material.topicTitle}
            </p>
          ) : null}
        </div>
      </div>
      {material.description ? <p className="mt-3 line-clamp-3 text-[0.93rem] text-muted">{material.description}</p> : null}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
        <Badge tone="success">Free</Badge>
        <Badge>{material.file_type}</Badge>
        {date ? <span>Added {date}</span> : null}
      </div>
      <div className="mt-auto flex flex-wrap gap-2 pt-5">
        {links.preview ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="navy" size="sm" className="min-h-10 flex-1">
                <Eye aria-hidden="true" /> {material.file_type === "PDF" ? "View PDF" : "View"}
                <span className="sr-only">: {material.title}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="h-[92dvh] max-w-5xl">
              <div className="border-b border-line py-3.5 pl-5 pr-14">
                <DialogTitle className="truncate font-heading text-base font-semibold text-navy">{material.title}</DialogTitle>
                <DialogDescription className="text-xs text-muted">
                  Preview by Google Drive. If it does not load,{" "}
                  <a href={links.open} target="_blank" rel="noopener noreferrer" className="font-semibold text-navy underline">open it in Google Drive</a>.
                </DialogDescription>
              </div>
              <iframe
                src={links.preview}
                title={`Preview of ${material.title}`}
                className="min-h-0 w-full flex-1 bg-paper"
                allow="autoplay"
                referrerPolicy="no-referrer"
              />
            </DialogContent>
          </Dialog>
        ) : null}
        <a href={links.open} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: links.preview ? "outline" : "navy", size: "sm" }), "min-h-10 flex-1")}>
          <ExternalLink aria-hidden="true" /> {isFolder ? "Open Folder" : "Open in Drive"}
          <span className="sr-only">: {material.title} (new tab)</span>
        </a>
        {links.download ? (
          <a href={links.download} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "min-h-10")} title="Download (where Google Drive allows it)">
            <Download aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">Download</span>
            <span className="sr-only">: {material.title}</span>
          </a>
        ) : null}
      </div>
    </article>
  );
}
