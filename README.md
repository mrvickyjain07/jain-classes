# Jain Classes

Website for **Jain Classes** (Prof. Madhusudan Jain): guidance and free study materials for UPSC, MPSC and other Maharashtra competitive examinations.

- Students: no registration, no login, no payment. Open the site, choose an examination, subject and topic, and read the notes.
- Administrator: one private login to a dashboard that manages all content.
- Content lives in a private **Google Sheet**. PDFs live in **Google Drive**. There is no database and no file upload to the website.

For day-to-day content work, see **[docs/ADMIN-GUIDE.md](docs/ADMIN-GUIDE.md)**.

## Contents

1. [Architecture](#1-architecture)
2. [Technology stack](#2-technology-stack)
3. [Folder structure](#3-folder-structure)
4. [Local installation](#4-local-installation)
5. [Environment variables](#5-environment-variables)
6. [Admin account](#6-admin-account)
7. [Google Cloud, service account and Sheets API](#7-google-cloud-service-account-and-sheets-api)
8. [Google Drive](#8-google-drive)
9. [Deploying on Vercel](#9-deploying-on-vercel)
10. [Custom domain](#10-custom-domain)
11. [Security](#11-security)
12. [Testing](#12-testing)
13. [Troubleshooting](#13-troubleshooting)

## 1. Architecture

```
 Student browser ──► Next.js on Vercel ──► cached published content ──┐
                          │                                           │
 Admin browser ──► /admin (Auth.js session) ──► Server Actions ──► Google Sheets API ──► "Jain Classes CMS" (private)
                                                                      (service account)
 Student clicks "View PDF" ──────────────────────────────────────► Google Drive (public "Anyone with the link" files)
```

- **Public pages** are statically generated and read published content through one cached server function. The cache refreshes every 5 minutes and immediately after any change in the dashboard.
- **Google Sheets** is read and written only on the server with a private service account. The spreadsheet itself is never public and credentials never reach the browser. One API call reads all six tabs.
- **Unpublished** records never leave the server. Unpublishing a course, subject or topic hides everything beneath it.
- **Google Drive** links are validated (Google hosts only) when saved and again when rendered. The site stores only the link and file id.
- **Admin** uses Auth.js (Credentials provider, JWT session in an HttpOnly cookie). Every dashboard page and every write action checks the session on the server.
- **WhatsApp** enquiries use click-to-chat links (`wa.me`). The visitor sends the message; the website stores nothing.

### Routes

| Public | Admin |
|---|---|
| `/`, `/about`, `/courses`, `/courses/[slug]` (`upsc`, `mpsc-rajyaseva`, `mpsc-group-b`, `mpsc-group-c`, ...) | `/admin/login` |
| `/study-materials` (`?course=&subject=&topic=`) | `/admin/dashboard` |
| `/current-affairs`, `/current-affairs/[slug]` | `/admin/dashboard/courses`, `/subjects`, `/topics`, `/materials`, `/current-affairs`, `/settings` |
| `/contact`, `/privacy-policy`, `/terms-and-conditions`, `/sitemap.xml`, `/robots.txt` | |

## 2. Technology stack

| Area | Choice |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4, shadcn-style components (Radix UI), Lucide icons |
| Backend | Server Components, Server Actions, one Auth.js route handler |
| Validation | Zod (shared between browser and server) |
| CMS | Google Sheets API v4 (REST, `google-auth-library` service account) |
| Files | Google Drive sharing links |
| Auth | Auth.js v5 Credentials provider, Argon2id password hash (`hash-wasm`) |
| Hosting | Vercel, source on GitHub |

Not used, by design: Supabase, PostgreSQL, MongoDB, Firebase, Prisma or any other database, and no PDF uploads.

## 3. Folder structure

```
public/images/            logo, professor photograph, banner (social preview)
src/app/(public)/         public pages, shared header/footer layout
src/app/admin/            login + dashboard pages
src/app/api/auth/         Auth.js route handler
src/components/           layout, home, courses, study-materials, shared, admin, ui
src/lib/google-sheets/    Sheets REST client (server only)
src/lib/google-drive/     Drive link validation and URL building
src/lib/cms/              sheet schema, starter content, storage, cached reads, admin actions
src/lib/auth/             Auth.js config, login/logout actions, login rate limit
src/lib/validation/       Zod schemas
src/lib/whatsapp/         click-to-chat helpers
scripts/create-admin.mjs  creates the admin password hash
tests/                    unit tests and a local Sheets emulator
docs/ADMIN-GUIDE.md       guide for the administrator
```

## 4. Local installation

Requires Node.js 20.9 or newer.

```bash
npm install
```

```bash
cp .env.example .env.local
```

```bash
npm run admin:create
```

Paste the two printed lines into `.env.local`, set `ADMIN_EMAIL`, then:

```bash
npm run dev
```

Open http://localhost:3000 and http://localhost:3000/admin/login.

**Without Google variables**, the site still runs locally: content is saved to `.data/cms.json` on your computer so you can try the dashboard. That file is ignored by git and is never used on Vercel.

## 5. Environment variables

| Variable | Purpose |
|---|---|
| `ADMIN_EMAIL` | Email the administrator logs in with |
| `ADMIN_PASSWORD_HASH` | Argon2id hash from `npm run admin:create` (the password itself is stored nowhere) |
| `AUTH_SECRET` | Random secret that signs the admin session cookie |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `client_email` from the service account JSON |
| `GOOGLE_PRIVATE_KEY` | `private_key` from the service account JSON |
| `GOOGLE_SHEETS_SPREADSHEET_ID` | Id of the "Jain Classes CMS" spreadsheet |
| `NEXT_PUBLIC_SITE_URL` | Public site address, e.g. `https://www.jainclasses.in` |

`GOOGLE_PRIVATE_KEY` is multi-line. Paste it exactly as it appears in the JSON file (with `\n` sequences). The app accepts it with or without surrounding quotes and converts `\n` to real line breaks. In `.env.local` keep it inside double quotes on one line.

Never commit `.env.local` or the service account JSON file. Both are covered by `.gitignore` patterns (`.env*`); keep the JSON file outside the project folder.

## 6. Admin account

There is one administrator and no sign-up page.

```bash
npm run admin:create
```

The script asks for a password (minimum 12 characters) and prints `ADMIN_PASSWORD_HASH` and a new `AUTH_SECRET`. To change the password later, run it again, replace `ADMIN_PASSWORD_HASH` in Vercel and redeploy. Replacing `AUTH_SECRET` as well signs out every existing session.

The hash is printed as `b64:...` because the `$` characters in a raw Argon2 hash are altered by `.env` files. A raw `$argon2id$...` value also works when entered directly in the Vercel dashboard.

## 7. Google Cloud, service account and Sheets API

Do this once, signed in as the official Jain Classes Google account.

1. Open https://console.cloud.google.com and create a project, for example `jain-classes-website`.
2. **APIs & Services > Library**: search for **Google Sheets API** and click **Enable**. (The Drive API is not needed.)
3. **APIs & Services > Credentials > Create credentials > Service account**. Name it `jain-classes-cms`. No roles are required. Finish.
4. Open the new service account > **Keys > Add key > Create new key > JSON**. A file downloads. Keep it private.
5. From that file copy `client_email` into `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `private_key` into `GOOGLE_PRIVATE_KEY`.
6. In Google Sheets create a blank spreadsheet named **Jain Classes CMS**.
7. Click **Share**, paste the service account email, choose **Editor**, untick "Notify people", and share. Leave general access as **Restricted**. The spreadsheet must stay private.
8. Copy the id from the spreadsheet URL (`https://docs.google.com/spreadsheets/d/THIS_PART/edit`) into `GOOGLE_SHEETS_SPREADSHEET_ID`.
9. Start or redeploy the site, log in at `/admin/login`, open **Website Settings** and click **Set up with starter content**. This creates the six tabs with their column headings and adds the starter courses, subjects and sample topics. It never changes existing rows and is safe to run again.

### Spreadsheet layout

| Tab | Columns |
|---|---|
| `Courses` | id, title, slug, description, category, image, display_order, published, created_at, updated_at |
| `Subjects` | id, course_id, title, slug, description, display_order, published, created_at, updated_at |
| `Topics` | id, subject_id, title, slug, description, display_order, published, created_at, updated_at |
| `Materials` | id, topic_id, title, description, google_drive_url, google_drive_file_id, file_type, display_order, published, featured, created_at, updated_at |
| `CurrentAffairs` | id, title, slug, summary, content, category, source_urls, relevant_exam, published, published_at, created_at, updated_at |
| `Settings` | setting_key, setting_value, updated_at |

Notes:

- Records are matched by their `id`, never by row number, so rows can be sorted or reordered in the sheet. Columns are matched by heading name, so do not rename headings.
- `published` is `TRUE` or `FALSE`.
- `featured` is an extra column on `Materials` used for the "Featured resources" block.
- Use the dashboard for normal work. If you edit the sheet by hand, the website picks the change up within 5 minutes.
- All values are written as plain text (never as formulas).

## 8. Google Drive

Suggested folder structure in the official Jain Classes Drive:

```
Jain Classes – Study Materials
├── UPSC
│   ├── Polity
│   ├── History
│   └── Geography
├── MPSC Rajyaseva
│   ├── Polity
│   ├── Maharashtra GK
│   ├── Economy
│   └── History
├── MPSC Group B
└── MPSC Group C
```

For every note: upload the PDF, **Share > General access > Anyone with the link > Viewer**, **Copy link**, then paste the link in **Admin > Study Materials**. Setting sharing once on a folder applies to every file placed inside it.

Important: "Anyone with the link" files are public. Anyone who receives the link can open the file without visiting the website. This is intended, because all materials are free. Do not put private documents in these folders.

Accepted links: `drive.google.com/file/d/ID/...`, `drive.google.com/open?id=ID`, `drive.google.com/drive/folders/ID`, and Google Docs, Slides and Sheets links. Anything else is rejected.

Students get **View PDF** (Google's preview inside the page), **Open in Drive** and **Download**. Downloading depends on Google: very popular files can hit Google's download quota, and owners can disable downloads for viewers. The site does not try to work around either.

## 9. Deploying on Vercel

1. Push this repository to GitHub.
2. In Vercel: **Add New > Project**, import the repository. Framework preset: Next.js. No build settings need changing.
3. **Settings > Environment Variables**: add all seven variables from section 5 for the Production environment (and Preview if you use it).
4. Deploy.
5. Log in at `https://your-site/admin/login`, open **Website Settings** and run the spreadsheet set-up (section 7, step 9).
6. Optional but recommended: **Firewall > Add rule**: rate limit `POST` requests to path `/admin/login` (for example 10 per minute per IP).

Every push to the main branch redeploys the site. Content changes never need a deploy.

## 10. Custom domain

1. Vercel > Project > **Settings > Domains** > add the domain, for example `jainclasses.in` and `www.jainclasses.in`.
2. At the domain registrar, add the DNS records Vercel shows (usually an `A` record for the root domain and a `CNAME` for `www`).
3. Wait for Vercel to show "Valid configuration". HTTPS is issued automatically.
4. Set `NEXT_PUBLIC_SITE_URL` to the final address (for example `https://www.jainclasses.in`) and redeploy so canonical links and the sitemap use it.
5. Submit `https://www.jainclasses.in/sitemap.xml` in Google Search Console.

## 11. Security

- Students have no accounts, so there is no student data to protect. The protected surface is the admin dashboard and the spreadsheet.
- Admin password: Argon2id hash only, verified on the server. Sessions: signed JWT in an HttpOnly, SameSite=Lax cookie (Secure on HTTPS), 8-hour lifetime.
- All admin pages and all Server Actions check the session on the server. Server Actions also have Next.js's built-in same-origin (CSRF) check.
- Login attempts: 5 failures in 15 minutes locks that IP address for 15 minutes; 40 failures site-wide pauses logins for 5 minutes. This counter is held in server memory, so on Vercel it is per server instance. Add the Vercel Firewall rule from section 9 for a hard limit.
- Google credentials are read only in server-only modules. The spreadsheet is shared only with the service account.
- All input is validated with Zod on the server. Admin-written text is rendered as text (no HTML injection). Drive links must be on Google hosts; source links must be http(s).
- Security headers: Content-Security-Policy (frames only from Google Drive/Docs), HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy. Admin pages are `noindex` and `no-store`.

## 12. Testing

```bash
npm run typecheck
```

```bash
npm run lint
```

```bash
npm test
```

```bash
npm run build
```

`npm test` covers Drive link validation, WhatsApp link building and slugs. To exercise the Google Sheets client without Google credentials, run the emulator in one terminal and the app in another:

```bash
node tests/sheets-emulator.mjs --with-default-sheet
```

```bash
SHEETS_EMULATOR_URL=http://localhost:4010 npm run dev
```

The emulator hook is ignored on Vercel.

## 13. Troubleshooting

| Problem | Fix |
|---|---|
| Login says "Admin login is not set up yet" | `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` or `AUTH_SECRET` is missing, or the hash was pasted without the `b64:` prefix into a `.env` file. Run `npm run admin:create` again. |
| "Google refused access to the spreadsheet" | Share the spreadsheet with the service account email as Editor, and enable the Google Sheets API in the same Cloud project. |
| "Could not sign in to Google with the service account" | `GOOGLE_PRIVATE_KEY` is damaged. Paste the full value including `-----BEGIN PRIVATE KEY-----` and the `\n` sequences. |
| "Spreadsheet not found" | Check `GOOGLE_SHEETS_SPREADSHEET_ID` (only the id, not the whole URL). |
| "A worksheet tab is missing" | Website Settings > run the spreadsheet set-up. |
| "Google Sheets is busy" | The API quota (about 60 requests a minute) was hit. Wait a minute. Public visitors do not use quota; only cache refreshes and admin work do. |
| Dashboard banner "Google Sheets is not connected" | The three `GOOGLE_*` variables are not set in Vercel for this environment. Add them and redeploy. |
| A note shows "Invalid Drive link" in the dashboard | Edit it and paste the link again using Share > Copy link in Google Drive. |
| Preview says "You need access" | The file is not shared as "Anyone with the link – Viewer". |
| A change made directly in the sheet is not visible | Wait up to 5 minutes, or save any record in the dashboard to refresh immediately. |
| Locked out after wrong passwords | Wait 15 minutes. |
