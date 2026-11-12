import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import * as sheets from "@/lib/google-sheets/client";
import { CmsError, TABS, TAB_NAMES, type RawTables, type Row, type TabName } from "./schema";
import { SEED } from "./seed";

/**
 * Content storage.
 *  - "sheets": the private Google Spreadsheet (production).
 *  - "local":  a JSON file in .data/ so the dashboard can be tried on a
 *              developer machine before Google is connected. Never used on Vercel.
 *  - "seed":   read-only starter content, shown when nothing is configured.
 */
export type Backend = "sheets" | "local" | "seed";

export function backend(): Backend {
  if (sheets.sheetsConfig()) return "sheets";
  if (process.env.VERCEL || process.env.CMS_DISABLE_LOCAL_STORE === "1") return "seed";
  return "local";
}

const LOCAL_FILE = path.join(process.cwd(), ".data", "cms.json");

async function readLocal(): Promise<RawTables> {
  try {
    const parsed = JSON.parse(await fs.readFile(LOCAL_FILE, "utf8")) as Partial<RawTables>;
    const out = {} as RawTables;
    for (const tab of TAB_NAMES) out[tab] = Array.isArray(parsed[tab]) ? (parsed[tab] as Row[]) : [];
    return out;
  } catch {
    return structuredClone(SEED);
  }
}

async function writeLocal(data: RawTables) {
  await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
  await fs.writeFile(LOCAL_FILE, JSON.stringify(data, null, 2));
}

const NOT_CONFIGURED =
  "Google Sheets is not connected yet, so changes cannot be saved. Add the Google environment variables in Vercel (see README).";

export async function readAll(): Promise<RawTables> {
  switch (backend()) {
    case "sheets":
      return sheets.readAllTabs();
    case "local":
      return readLocal();
    default:
      return structuredClone(SEED);
  }
}

export async function insertRow(tab: TabName, row: Row): Promise<void> {
  switch (backend()) {
    case "sheets":
      return sheets.appendRow(tab, row);
    case "local": {
      const data = await readLocal();
      data[tab].push(row);
      return writeLocal(data);
    }
    default:
      throw new CmsError("not_configured", NOT_CONFIGURED);
  }
}

export async function updateRow(tab: TabName, keyColumn: string, keyValue: string, patch: Row): Promise<void> {
  switch (backend()) {
    case "sheets":
      return sheets.updateRow(tab, keyColumn, keyValue, patch);
    case "local": {
      const data = await readLocal();
      const index = data[tab].findIndex((r) => r[keyColumn] === keyValue);
      if (index < 0) throw new CmsError("not_found", "That record no longer exists. Refresh the page and try again.");
      data[tab][index] = { ...data[tab][index], ...patch };
      return writeLocal(data);
    }
    default:
      throw new CmsError("not_configured", NOT_CONFIGURED);
  }
}

export async function deleteRow(tab: TabName, keyColumn: string, keyValue: string): Promise<void> {
  switch (backend()) {
    case "sheets":
      return sheets.deleteRow(tab, keyColumn, keyValue);
    case "local": {
      const data = await readLocal();
      const index = data[tab].findIndex((r) => r[keyColumn] === keyValue);
      if (index < 0) throw new CmsError("not_found", "That record no longer exists. Refresh the page and try again.");
      data[tab].splice(index, 1);
      return writeLocal(data);
    }
    default:
      throw new CmsError("not_configured", NOT_CONFIGURED);
  }
}

export async function setup(withStarterContent: boolean): Promise<string[]> {
  switch (backend()) {
    case "sheets":
      return sheets.setupSpreadsheet(withStarterContent ? SEED : undefined);
    case "local": {
      const data = await readLocal();
      await writeLocal(data);
      return [`Local development file is ready (${Object.keys(TABS).length} tabs).`];
    }
    default:
      throw new CmsError("not_configured", NOT_CONFIGURED);
  }
}
