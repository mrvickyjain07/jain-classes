import "server-only";
import { Redis } from "@upstash/redis";
import { CmsError, TAB_NAMES, type RawTables, type Row, type TabName } from "@/lib/cms/schema";

/**
 * Upstash Redis backend for the CMS.
 * All content is stored as a single JSON blob under the key "cms:data".
 * This keeps the read path to one network round-trip, matching the behaviour
 * of the Google Sheets client which also reads all tabs in one call.
 */

const CMS_KEY = "cms:data";

export function upstashConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  return { url, token };
}

function makeClient() {
  const cfg = upstashConfig();
  if (!cfg) throw new CmsError("not_configured", "Upstash Redis is not configured. Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.");
  return new Redis({ url: cfg.url, token: cfg.token });
}

function emptyTables(): RawTables {
  return Object.fromEntries(TAB_NAMES.map((t) => [t, [] as Row[]])) as unknown as RawTables;
}

export async function readAllTabs(): Promise<RawTables> {
  const client = makeClient();
  const data = await client.get<RawTables>(CMS_KEY);
  if (!data) return emptyTables();
  // Fill in any missing tabs (e.g. after a schema addition)
  for (const tab of TAB_NAMES) {
    if (!Array.isArray(data[tab])) data[tab] = [];
  }
  return data;
}

export async function writeAllTabs(data: RawTables): Promise<void> {
  const client = makeClient();
  await client.set(CMS_KEY, data);
}

export async function appendRow(tab: TabName, row: Row): Promise<void> {
  const data = await readAllTabs();
  data[tab].push(row);
  await writeAllTabs(data);
}

export async function updateRow(
  tab: TabName,
  keyColumn: string,
  keyValue: string,
  patch: Row,
): Promise<void> {
  const data = await readAllTabs();
  const index = data[tab].findIndex((r) => r[keyColumn] === keyValue);
  if (index < 0) throw new CmsError("not_found", "That record no longer exists. Refresh the page and try again.");
  data[tab][index] = { ...data[tab][index], ...patch };
  await writeAllTabs(data);
}

export async function deleteRow(tab: TabName, keyColumn: string, keyValue: string): Promise<void> {
  const data = await readAllTabs();
  const index = data[tab].findIndex((r) => r[keyColumn] === keyValue);
  if (index < 0) throw new CmsError("not_found", "That record no longer exists. Refresh the page and try again.");
  data[tab].splice(index, 1);
  await writeAllTabs(data);
}

export async function setupDatabase(seed?: RawTables): Promise<string[]> {
  const client = makeClient();
  const existing = await client.get<RawTables>(CMS_KEY);
  const log: string[] = [];

  if (!existing) {
    await client.set(CMS_KEY, seed ?? emptyTables());
    log.push(seed ? "Database seeded with starter content." : "Empty database created.");
  } else {
    // Ensure all tabs exist without overwriting existing data
    let changed = false;
    for (const tab of TAB_NAMES) {
      if (!Array.isArray(existing[tab])) {
        existing[tab] = seed?.[tab] ?? [];
        changed = true;
        log.push(`Added missing tab: ${tab}.`);
      }
    }
    if (changed) await client.set(CMS_KEY, existing);
    if (!log.length) log.push("Database already set up — no changes made.");
  }

  return log;
}
