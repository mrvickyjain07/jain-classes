/**
 * Google Drive link handling.
 *
 * Study notes live in the institute's Google Drive. The website only stores
 * the sharing URL, so every URL is validated here (client and server) before
 * it is saved or rendered. Only Google Drive / Docs hosts are accepted.
 */

export type DriveKind = "file" | "document" | "presentation" | "spreadsheet" | "folder";

export type DriveLink = {
  id: string;
  kind: DriveKind;
  /** Opens the item in Google Drive. */
  open: string;
  /** Embeddable preview, when Google supports one for this kind. */
  preview: string | null;
  /** Direct download / PDF export. Google may still refuse (quota, owner settings). */
  download: string | null;
};

const ALLOWED_HOSTS = new Set(["drive.google.com", "docs.google.com"]);
const ID_PATTERN = /^[A-Za-z0-9_-]{10,200}$/;

export const DRIVE_URL_HELP =
  "Paste a Google Drive sharing link, for example https://drive.google.com/file/d/FILE_ID/view";

export function parseDriveUrl(input: string): DriveLink | null {
  const raw = (input ?? "").trim();
  if (!raw || raw.length > 2000) return null;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || !ALLOWED_HOSTS.has(url.hostname)) return null;
  if (url.username || url.password || url.port) return null;

  const path = url.pathname;
  let id: string | null = null;
  let kind: DriveKind | null = null;

  if (url.hostname === "drive.google.com") {
    const file = path.match(/^\/file\/(?:u\/\d+\/)?d\/([^/]+)/);
    const folder = path.match(/^\/drive\/(?:u\/\d+\/)?folders\/([^/]+)/);
    if (file) {
      id = file[1];
      kind = "file";
    } else if (folder) {
      id = folder[1];
      kind = "folder";
    } else if (path === "/open" || path === "/uc" || path === "/u/0/uc") {
      id = url.searchParams.get("id");
      kind = "file";
    }
  } else {
    const doc = path.match(/^\/(document|presentation|spreadsheets)\/(?:u\/\d+\/)?d\/([^/]+)/);
    if (doc) {
      id = doc[2];
      kind = doc[1] === "spreadsheets" ? "spreadsheet" : (doc[1] as DriveKind);
    }
  }

  if (!id || !kind || !ID_PATTERN.test(id)) return null;
  return buildDriveLink(id, kind);
}

export function buildDriveLink(id: string, kind: DriveKind): DriveLink {
  switch (kind) {
    case "file":
      return {
        id,
        kind,
        open: `https://drive.google.com/file/d/${id}/view`,
        preview: `https://drive.google.com/file/d/${id}/preview`,
        download: `https://drive.google.com/uc?export=download&id=${id}`,
      };
    case "document":
      return {
        id,
        kind,
        open: `https://docs.google.com/document/d/${id}/edit?usp=sharing`,
        preview: `https://docs.google.com/document/d/${id}/preview`,
        download: `https://docs.google.com/document/d/${id}/export?format=pdf`,
      };
    case "presentation":
      return {
        id,
        kind,
        open: `https://docs.google.com/presentation/d/${id}/edit?usp=sharing`,
        preview: `https://docs.google.com/presentation/d/${id}/preview`,
        download: `https://docs.google.com/presentation/d/${id}/export/pdf`,
      };
    case "spreadsheet":
      return {
        id,
        kind,
        open: `https://docs.google.com/spreadsheets/d/${id}/edit?usp=sharing`,
        preview: `https://docs.google.com/spreadsheets/d/${id}/preview`,
        download: `https://docs.google.com/spreadsheets/d/${id}/export?format=pdf`,
      };
    case "folder":
      return {
        id,
        kind,
        open: `https://drive.google.com/drive/folders/${id}`,
        preview: null,
        download: null,
      };
  }
}

export const FILE_TYPES = ["PDF", "Google Doc", "Google Slides", "Google Sheet", "Folder", "Other"] as const;

export function defaultFileType(kind: DriveKind): (typeof FILE_TYPES)[number] {
  switch (kind) {
    case "document":
      return "Google Doc";
    case "presentation":
      return "Google Slides";
    case "spreadsheet":
      return "Google Sheet";
    case "folder":
      return "Folder";
    default:
      return "PDF";
  }
}
