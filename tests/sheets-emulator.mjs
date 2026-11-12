#!/usr/bin/env node
/**
 * Tiny in-memory stand-in for the Google Sheets REST API, used only for local
 * testing of src/lib/google-sheets/client.ts without Google credentials.
 *   node tests/sheets-emulator.mjs            (listens on :4010)
 *   SHEETS_EMULATOR_URL=http://localhost:4010 npm run start
 * GET /__dump returns the whole fake spreadsheet as JSON.
 */
import http from "node:http";

const sheets = new Map(); // title -> { sheetId, rows: string[][] }
let nextId = 1;
if (process.argv.includes("--with-default-sheet")) sheets.set("Sheet1", { sheetId: 0, rows: [] });

const trim = (rows) => {
  const out = rows.map((r) => { const c = [...r]; while (c.length && (c.at(-1) ?? "") === "") c.pop(); return c; });
  while (out.length && out.at(-1).length === 0) out.pop();
  return out;
};
const parseRange = (range) => {
  const m = decodeURIComponent(range).match(/^(.+?)!([A-Z])(\d+)(?::([A-Z])(\d*))?$/);
  if (!m) return null;
  return { tab: m[1], col: m[2].charCodeAt(0) - 65, row: Number(m[3]) - 1 };
};
const send = (res, status, body) => { res.writeHead(status, { "Content-Type": "application/json" }); res.end(JSON.stringify(body)); };
const badRange = (res, r) => send(res, 400, { error: { code: 400, message: `Unable to parse range: ${r}` } });

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  let body = ""; for await (const chunk of req) body += chunk;
  const json = body ? JSON.parse(body) : {};
  const path = url.pathname;
  if (path === "/__dump") return send(res, 200, Object.fromEntries([...sheets].map(([k, v]) => [k, v.rows])));
  if (req.headers.authorization !== "Bearer emulator") return send(res, 401, { error: { code: 401 } });
  if (!path.startsWith("/test")) return send(res, 404, { error: { code: 404 } });
  const rest = path.slice(5);

  if (rest === "" && req.method === "GET") {
    return send(res, 200, { sheets: [...sheets].map(([title, s]) => ({ properties: { sheetId: s.sheetId, title } })) });
  }
  if (rest === ":batchUpdate") {
    for (const r of json.requests ?? []) {
      if (r.addSheet) sheets.set(r.addSheet.properties.title, { sheetId: nextId++, rows: [] });
      if (r.deleteDimension) {
        const { sheetId, startIndex, endIndex } = r.deleteDimension.range;
        const sheet = [...sheets.values()].find((s) => s.sheetId === sheetId);
        if (!sheet) return send(res, 400, { error: { code: 400, message: "No sheet" } });
        sheet.rows.splice(startIndex, endIndex - startIndex);
      }
    }
    return send(res, 200, { replies: [] });
  }
  if (rest === "/values:batchGet") {
    const ranges = url.searchParams.getAll("ranges"), valueRanges = [];
    for (const r of ranges) {
      const p = parseRange(r);
      if (!p || !sheets.has(p.tab)) return badRange(res, r);
      const values = trim(sheets.get(p.tab).rows);
      valueRanges.push(values.length ? { range: r, values } : { range: r });
    }
    return send(res, 200, { valueRanges });
  }
  if (rest.startsWith("/values/")) {
    const isAppend = rest.endsWith(":append");
    const raw = rest.slice(8, isAppend ? -7 : undefined);
    const p = parseRange(raw);
    if (!p || !sheets.has(p.tab)) return badRange(res, raw);
    const sheet = sheets.get(p.tab);
    if (req.method === "GET") { const values = trim(sheet.rows); return send(res, 200, values.length ? { values } : {}); }
    if (url.searchParams.get("valueInputOption") !== "RAW") return send(res, 400, { error: { message: "expected RAW" } });
    if (isAppend) { sheet.rows = trim(sheet.rows); sheet.rows.push(...json.values.map((r) => r.map(String))); return send(res, 200, {}); }
    json.values.forEach((cells, i) => {
      const row = (sheet.rows[p.row + i] ??= []);
      for (let k = 0; k < p.row + i; k++) sheet.rows[k] ??= [];
      cells.forEach((c, j) => { row[p.col + j] = String(c); });
    });
    return send(res, 200, {});
  }
  send(res, 404, { error: { code: 404 } });
}).listen(Number(process.env.PORT ?? 4010), () => console.log("Sheets emulator ready"));
