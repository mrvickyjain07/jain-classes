import "server-only";
import { JWT } from "google-auth-library";
import { CmsError, TABS, TAB_NAMES, type RawTables, type Row, type TabName } from "@/lib/cms/schema";

/**
 * Minimal Google Sheets REST client (server-side only).
 * Authenticates as a private service account; credentials never reach the browser.
 * All writes use valueInputOption=RAW so cell content can never be executed as a formula.
 */

// Test hook: point the client at a local Sheets emulator (see tests/sheets-emulator.mjs).
// Ignored on Vercel, so it can never redirect production traffic.
const EMULATOR = process.env.VERCEL ? undefined : process.env.SHEETS_EMULATOR_URL?.trim() || undefined;
const API = EMULATOR ?? "https://sheets.googleapis.com/v4/spreadsheets";

export function sheetsConfig() {
  if (EMULATOR) return { email: "emulator", key: "", spreadsheetId: "test" };
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim();
  let key = process.env.GOOGLE_PRIVATE_KEY?.trim();
  if (!email || !spreadsheetId || !key) return null;
  // Accept keys pasted with surrounding quotes and/or literal "\n" sequences.
  key = key.replace(/^["']|["']$/g, "").replace(/\\n/g, "\n");
  return { email, key, spreadsheetId };
}

let jwt: JWT | null = null;

async function token(): Promise<string> {
  const config = sheetsConfig();
  if (!config) throw new CmsError("not_configured", "Google Sheets is not configured.");
  if (EMULATOR) return "emulator";
  jwt ??= new JWT({
    email: config.email,
    key: config.key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  try {
    const { token } = await jwt.getAccessToken();
    if (!token) throw new Error("empty token");
    return token;
  } catch (error) {
    jwt = null;
    console.error("[sheets] service account authentication failed:", (error as Error).message);
    throw new CmsError(
      "auth",
      "Could not sign in to Google with the service account. Check GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY.",
    );
  }
}

async function request<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const config = sheetsConfig();
  if (!config) throw new CmsError("not_configured", "Google Sheets is not configured.");
  const accessToken = await token();

  let response: Response;
  try {
    response = await fetch(`${API}/${config.spreadsheetId}${path}`, {
      method: init?.method ?? "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
      },
      body: init?.body ? JSON.stringify(init.body) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    console.error("[sheets] network error:", (error as Error).message);
    throw new CmsError("api", "Could not reach Google Sheets. Please try again in a moment.");
  }

  if (response.ok) return (await response.json()) as T;

  const detail = await response.text().catch(() => "");
  console.error(`[sheets] ${response.status} on ${path.split("?")[0]}: ${detail.slice(0, 300)}`);
  if (response.status === 429) {
    throw new CmsError("quota", "Google Sheets is busy (request limit reached). Please wait a minute and try again.");
  }
  if (response.status === 401 || response.status === 403) {
    throw new CmsError(
      "auth",
      "Google refused access to the spreadsheet. Share the spreadsheet with the service account email as Editor and enable the Google Sheets API.",
    );
  }
  if (response.status === 404) {
    throw new CmsError("not_found", "Spreadsheet not found. Check GOOGLE_SHEETS_SPREADSHEET_ID.");
  }
  if (response.status === 400 && /Unable to parse range/i.test(detail)) {
    throw new CmsError("not_found", "A worksheet tab is missing. Run the spreadsheet set-up from Website Settings.");
  }
  throw new CmsError("api", "Google Sheets returned an error. Please try again.");
}

const colLetter = (index: number) => String.fromCharCode(65 + index); // tabs have < 26 columns

function toRows(values: string[][] | undefined): { header: string[]; rows: Row[] } {
  if (!values || values.length === 0) return { header: [], rows: [] };
  const header = values[0].map((h) => String(h ?? "").trim());
  const rows: Row[] = [];
  for (let i = 1; i < values.length; i++) {
    const cells = values[i] ?? [];
    if (cells.every((c) => String(c ?? "").trim() === "")) continue;
    const row: Row = { __row: String(i + 1) };
    header.forEach((name, c) => {
      if (name) row[name] = String(cells[c] ?? "");
    });
    rows.push(row);
  }
  return { header, rows };
}

async function readTab(tab: TabName) {
  const data = await request<{ values?: string[][] }>(`/values/${encodeURIComponent(`${tab}!A1:Z`)}`);
  return toRows(data.values);
}

/** Reads every tab with a single API call. Missing tabs are returned empty. */
export async function readAllTabs(): Promise<RawTables> {
  const query = TAB_NAMES.map((t) => `ranges=${encodeURIComponent(`${t}!A1:Z`)}`).join("&");
  try {
    const data = await request<{ valueRanges: { values?: string[][] }[] }>(`/values:batchGet?${query}`);
    const out = {} as RawTables;
    TAB_NAMES.forEach((tab, i) => {
      out[tab] = toRows(data.valueRanges[i]?.values).rows;
    });
    return out;
  } catch (error) {
    if (error instanceof CmsError && error.code === "not_found" && /tab is missing/.test(error.message)) {
      const out = {} as RawTables;
      for (const tab of TAB_NAMES) {
        out[tab] = await readTab(tab).then((r) => r.rows).catch(() => []);
      }
      return out;
    }
    throw error;
  }
}

function toCells(header: string[], row: Row): string[] {
  return header.map((name) => (name ? (row[name] ?? "") : ""));
}

async function headerOf(tab: TabName): Promise<{ header: string[]; rows: Row[] }> {
  const current = await readTab(tab);
  if (current.header.filter(Boolean).length > 0) return current;
  const header = [...TABS[tab]];
  await request(`/values/${encodeURIComponent(`${tab}!A1`)}?valueInputOption=RAW`, {
    method: "PUT",
    body: { values: [header] },
  });
  return { header, rows: [] };
}

export async function appendRow(tab: TabName, row: Row): Promise<void> {
  const { header } = await headerOf(tab);
  await request(
    `/values/${encodeURIComponent(`${tab}!A1`)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    { method: "POST", body: { values: [toCells(header, row)] } },
  );
}

export async function updateRow(tab: TabName, keyColumn: string, keyValue: string, patch: Row): Promise<void> {
  const { header, rows } = await headerOf(tab);
  const existing = rows.find((r) => r[keyColumn] === keyValue);
  if (!existing) throw new CmsError("not_found", "That record no longer exists. Refresh the page and try again.");
  const merged = { ...existing, ...patch };
  const rowNumber = existing.__row;
  const range = `${tab}!A${rowNumber}:${colLetter(header.length - 1)}${rowNumber}`;
  await request(`/values/${encodeURIComponent(range)}?valueInputOption=RAW`, {
    method: "PUT",
    body: { values: [toCells(header, merged)] },
  });
}

type SheetMeta = { sheets: { properties: { sheetId: number; title: string } }[] };

export async function deleteRow(tab: TabName, keyColumn: string, keyValue: string): Promise<void> {
  const { rows } = await readTab(tab);
  const existing = rows.find((r) => r[keyColumn] === keyValue);
  if (!existing) throw new CmsError("not_found", "That record no longer exists. Refresh the page and try again.");
  const meta = await request<SheetMeta>("?fields=sheets.properties(sheetId,title)");
  const sheet = meta.sheets.find((s) => s.properties.title === tab);
  if (!sheet) throw new CmsError("not_found", `Worksheet "${tab}" is missing.`);
  const index = Number(existing.__row) - 1;
  await request(":batchUpdate", {
    method: "POST",
    body: {
      requests: [
        {
          deleteDimension: {
            range: { sheetId: sheet.properties.sheetId, dimension: "ROWS", startIndex: index, endIndex: index + 1 },
          },
        },
      ],
    },
  });
}

/**
 * Creates any missing worksheet tabs and header columns. Existing data is never
 * removed. When `seed` is given, tabs that have no data rows are pre-filled.
 */
export async function setupSpreadsheet(seed?: RawTables): Promise<string[]> {
  const log: string[] = [];
  const meta = await request<SheetMeta>("?fields=sheets.properties(sheetId,title)");
  const existing = new Set(meta.sheets.map((s) => s.properties.title));
  const missing = TAB_NAMES.filter((t) => !existing.has(t));
  if (missing.length > 0) {
    await request(":batchUpdate", {
      method: "POST",
      body: { requests: missing.map((title) => ({ addSheet: { properties: { title } } })) },
    });
    log.push(`Created tabs: ${missing.join(", ")}`);
  }
  for (const tab of TAB_NAMES) {
    const { header, rows } = await readTab(tab);
    const wanted = [...TABS[tab]] as string[];
    const named = header.filter(Boolean);
    const finalHeader = named.length === 0 ? wanted : [...header, ...wanted.filter((c) => !header.includes(c))];
    if (finalHeader.length !== header.length || named.length === 0) {
      await request(`/values/${encodeURIComponent(`${tab}!A1`)}?valueInputOption=RAW`, {
        method: "PUT",
        body: { values: [finalHeader] },
      });
      log.push(`${tab}: header columns written`);
    }
    if (seed && rows.length === 0 && seed[tab].length > 0) {
      await request(
        `/values/${encodeURIComponent(`${tab}!A1`)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
        { method: "POST", body: { values: seed[tab].map((r) => toCells(finalHeader, r)) } },
      );
      log.push(`${tab}: ${seed[tab].length} starter rows added`);
    }
  }
  if (log.length === 0) log.push("Spreadsheet already has every tab and column.");
  return log;
}
