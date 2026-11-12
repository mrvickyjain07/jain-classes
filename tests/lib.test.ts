import assert from "node:assert/strict";
import { test } from "node:test";
import { parseDriveUrl } from "../src/lib/google-drive/index.ts";
import { slugify } from "../src/lib/utils.ts";
import { enquiryMessage, normaliseWhatsAppNumber, whatsappUrl } from "../src/lib/whatsapp/index.ts";

const ID = "1AbCdEfGhIjKlMnOpQrStUvWxYz012345";

test("accepts supported Google Drive links and extracts the file id", () => {
  for (const url of [
    `https://drive.google.com/file/d/${ID}/view`,
    `https://drive.google.com/file/d/${ID}/view?usp=sharing`,
    `https://drive.google.com/file/u/1/d/${ID}/preview`,
    `https://drive.google.com/open?id=${ID}`,
    `https://drive.google.com/uc?export=download&id=${ID}`,
  ]) {
    const link = parseDriveUrl(url);
    assert.equal(link?.id, ID, url);
    assert.equal(link?.kind, "file");
    assert.equal(link?.preview, `https://drive.google.com/file/d/${ID}/preview`);
  }
  assert.equal(parseDriveUrl(`https://docs.google.com/document/d/${ID}/edit`)?.kind, "document");
  assert.equal(parseDriveUrl(`https://docs.google.com/presentation/d/${ID}/edit#slide=1`)?.kind, "presentation");
  assert.equal(parseDriveUrl(`https://docs.google.com/spreadsheets/d/${ID}/edit`)?.kind, "spreadsheet");
  const folder = parseDriveUrl(`https://drive.google.com/drive/folders/${ID}?usp=sharing`);
  assert.equal(folder?.kind, "folder");
  assert.equal(folder?.preview, null);
});

test("rejects malformed links and other domains", () => {
  for (const url of [
    "", "not a url", "javascript:alert(1)",
    `http://drive.google.com/file/d/${ID}/view`,
    `https://evil.example.com/file/d/${ID}/view`,
    `https://drive.google.com.evil.com/file/d/${ID}/view`,
    `https://user:pw@drive.google.com/file/d/${ID}/view`,
    `https://evil.com/?https://drive.google.com/file/d/${ID}/view`,
    "https://drive.google.com/file/d/short/view",
    `https://drive.google.com/file/d/${ID}%22onload=x/view`,
    "https://drive.google.com/open?id=<script>",
    "https://drive.google.com/drive/my-drive",
  ]) {
    assert.equal(parseDriveUrl(url), null, url);
  }
});

test("builds WhatsApp click-to-chat links", () => {
  assert.equal(normaliseWhatsAppNumber("+91 75585 36630"), "917558536630");
  assert.equal(normaliseWhatsAppNumber("7558536630"), "917558536630");
  assert.equal(normaliseWhatsAppNumber("garbage"), "917558536630");
  const url = whatsappUrl("917558536630", "Hello & welcome\nनमस्ते");
  assert.ok(url.startsWith("https://wa.me/917558536630?text="));
  assert.equal(decodeURIComponent(url.split("text=")[1]), "Hello & welcome\nनमस्ते");
  const message = enquiryMessage({ name: "A", mobile: "9876543210", exam: "MPSC", course: "", message: "" });
  assert.match(message, /Student Name: A/);
  assert.match(message, /Course: Not decided yet/);
});

test("slugify produces URL-safe slugs", () => {
  assert.equal(slugify("MPSC Group B & C!"), "mpsc-group-b-and-c");
  assert.equal(slugify("  Fundamental   Rights "), "fundamental-rights");
  assert.equal(slugify("राज्यशास्त्र"), "");
});
