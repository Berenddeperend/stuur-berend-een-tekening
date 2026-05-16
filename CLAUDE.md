# CLAUDE.md

Context for Claude Code when working in this repo.

## Project

A web app where visitors draw on a canvas. On submit, the drawing is printed on a thermal printer in my living room. Later, I photograph the physical print with a one-off Flutter app and upload it to the site's public gallery.

## Architecture

A Raspberry Pi 4 and a Raspberry Pi 3B on the same LAN.

- **Web Pi** — Raspberry Pi 4. Runs Caddy and Docker. Hosts the Nuxt app, the SQLite DB, and the photo folder. Reachable from the internet via Caddy (TLS, reverse proxy).
- **Printer Pi** — Raspberry Pi 3B in the living room with a thermal printer attached via USB. Minimal setup. No Caddy, no public exposure. Runs only the print-agent process. Long-polls the web Pi for jobs. Concrete OS / container / service setup lives in the printer-pi repo, not here. Add it to Claude's context with `claude --add-dir` when working on cross-Pi changes.
- **Flutter uploader** — single-screen mobile app. Camera → photo → POST to web Pi. Bearer token baked into the build.

## Tech stack

- Nuxt 4 running on Node (version pinned in `.nvmrc`, currently Node 24). Nitro server routes for the API; no separate backend service.
- `@nuxtjs/i18n` for the bilingual frontend (NL default, EN secondary).
- SQLite via `node:sqlite` (built-in to Node 22+, no native module to compile), WAL mode enabled.
- Print agent: Node, ESC/POS over USB. Fall back to Python with `python-escpos` only if a Node-compatible USB/ESC-POS library proves unworkable on the printer Pi.
- Flutter for the mobile uploader.
- Docker on the web Pi. The printer Pi runs the agent natively or in a container — defined in the printer-pi repo, not here.
- Caddy on the web Pi for TLS + reverse proxy (already running). The project lives on its own dedicated domain (TBD), not as a subdomain of an existing one.

## Storage layout

Docker volumes on the web Pi, mounted into the Nuxt container:

```
/data/drawings/   submitted PNGs, archive, kept forever
/data/photos/     flutter-uploaded photos, the public gallery
/data/db.sqlite   metadata for /data/drawings/ only
```

**The DB and the photos folder are independent.** They are never joined or linked. There is no foreign key between a DB row and a gallery photo.

## Data model

One table.

`drawings`

- `id` — string, nanoid
- `created_at` — timestamp. This is also the "submitted at" value printed in the header.
- `author_name` — text. Resolves to `'anoniem'` if the submitter leaves it blank. Stored as the resolved value, never NULL.
- `png_path` — path under `/data/drawings/`
- `print_status` — `queued` | `printing` | `printed` | `failed`
- `printed_at` — timestamp, nullable
- `attempts` — integer
- `last_error` — text, nullable

Rows and PNG files are never deleted on success. The DB is an append-only archive of every submission.

The `/data/photos/` folder has no DB representation. Filenames are timestamps, e.g. `2026-05-08T14-23-45.jpg`, sorted by mtime descending for the gallery.

## API surface (Nuxt server routes)

Public:

- `POST /api/drawings` — submit a canvas PNG and an optional author name. Resolves missing/empty author to `'anoniem'`. Stores the dithered, printer-width-sized PNG under `/data/drawings/` (drawing only, no header), inserts a row with `status=queued`, returns `202 Accepted`.
- `GET /api/photos` — returns list of photo filenames sorted by mtime descending.
- `GET /api/photos/:filename` — streams the image bytes (long `Cache-Control`, filenames are immutable).

Auth required (bearer token):

- `GET /api/print-queue/next` — long-poll. Returns immediately if a job is queued. Otherwise blocks for up to ~60s, returning the next job as soon as one is enqueued, or `null` on timeout. Payload: `{ id, png_url, author_name, submitted_at }`.
- `GET /api/drawings/:id/png` — returns the raw print-ready PNG bytes for a queued/printing job. Called by the print agent after `next`.
- `POST /api/print-queue/:id/ack` — print agent acks. Body: `{ status: "printed" | "failed", error?: string }`.
- `POST /api/photos/upload` — Flutter app uploads a photo. Saves to `/data/photos/` with timestamp filename.

## Print agent behaviour

Loop:

1. `GET /api/print-queue/next` (long-poll, blocks up to ~60s). Receive `{ id, png_url, author_name, submitted_at }`.
2. `GET` the PNG from `png_url`.
3. Print, in this order: ESC/POS text header (author name + submission timestamp), then the image bitmap, then cut.
4. `POST /api/print-queue/:id/ack` with success or failure.
5. On `null` (timeout), reconnect immediately. No client-side sleep — the long-poll handles back-pressure server-side.

On failed ack, the web Pi increments `attempts` and either re-queues or marks `failed` after a ceiling.

**Idempotency**: the agent records its own last-printed id locally to reject duplicate jobs if an ack fails to land due to a network blip.

## Key decisions and rationale

**Long-polling, not separate poll + push channels.** The print agent holds an open `GET /api/print-queue/next` request that blocks until a job is queued (or ~60s timeout). When `POST /api/drawings` enqueues a job, the in-process handler signals the open long-poll, which returns immediately. This gives push-like latency (sub-second from submit to print start) with no exposed endpoint on the printer Pi and no second notification channel to maintain. Periodic safety re-poll falls out for free — every long-poll timeout is itself a reconnect.

**Image prep on the web Pi, header on the printer Pi.** The drawing PNG is dithered and sized to the printer's pixel width on the web Pi — the agent never resizes or dithers. The header (author + submission timestamp) is rendered by the agent via ESC/POS text commands at print time, not baked into the image. ESC/POS text is sharper than rasterized text at 384 px, and the archive PNG stays unmodified. Slight increase in agent responsibility, in exchange for crisper output and a clean archive.

**Queue-based submit, not synchronous print.** `POST /api/drawings` returns `202 queued` rather than waiting for the printer. Trade-off: the user doesn't get instant "it printed" feedback. The UI says "queued for printing." Benefit: paper jams, printer reboots, and printer Pi outages don't break submit.

**DB and gallery are decoupled.** The DB is a private archive of digital submissions and their print status. The public gallery is just whatever images are in `/data/photos/`. No QR codes on prints, no matching workflow.

**Nuxt serves the photo bytes, not Caddy.** Easier config, slightly slower, fine at this scale. Long `Cache-Control` headers compensate.

**No job expiry.** If the printer is offline for hours, the backlog is preserved and prints in order when it comes back. Intentional — prefer "every drawing reaches paper" over "no backlog after downtime."

## Explicitly rejected approaches

- **QR codes on the printed paper.** Was an option for linking gallery photos back to DB drawings. Rejected — we don't want to link them.
- **Direct push from web Pi to printer Pi.** Would require exposing the printer Pi to the network. Adds fragility for no upside.
- **Storing photos in the DB.** Filesystem is sufficient. Filenames carry the only metadata we need (timestamp).
- **Matching uploaded photos to drawings.** I take photos in my own time, possibly out of order, possibly skipping prints. Forcing a matching workflow adds friction for negligible benefit.
- **Caddy serving photo bytes directly.** Considered, abandoned in favour of Nuxt serving them for config simplicity.
- **Query-parameter language switching (`?lang=en`).** Considered for external links. Rejected in favour of `@nuxtjs/i18n`'s `prefix_except_default` strategy — `/en/` URLs are shareable, SEO-clean, and framework-native. External sites just link to `/en/` directly.

## Auth

Two bearer tokens via env vars:

- `PRINT_AGENT_TOKEN` — shared between web Pi and printer Pi
- `UPLOAD_TOKEN` — baked into the Flutter build

Personal-scale threat model. No user accounts. The public `POST /api/drawings` endpoint is unauthenticated but rate-limited (per-IP daily cap) to prevent paper waste.

## Internationalization (i18n)

The site is bilingual: Dutch and English. **Dutch is the default.**

Implemented with `@nuxtjs/i18n` using the `prefix_except_default` strategy:

- Dutch (default): `https://drawingdomain.example/`
- English: `https://drawingdomain.example/en/`

External sites linking in for English-speaking visitors link to `/en/` directly — the URL carries the language, no query parameter, no redirect dance. A returning visitor's choice is persisted in a cookie, so a second visit to `/` honours their last selection (still falling back to Dutch).

Translation files live under `i18n/locales/nl.json` and `i18n/locales/en.json`. Dutch is the source of truth for new strings — when adding copy, write Dutch first and translate to English second.

API routes (`/api/*`) are language-agnostic. i18n applies only to user-facing pages.

## Printer constraints

- Thermal printer width: typically 384 px (58 mm rolls) or 576 px (80 mm rolls). Confirm before rendering.
- Canvas aspect ratio on the website should match printer width to avoid cropping or wasted paper.
- Dithering (Atkinson or Floyd-Steinberg) is done on the web Pi when the PNG is prepared for the agent.
- Thermal prints fade. Photograph soon after printing for best gallery quality.

## Print output format

Each receipt is composed by the print agent in three parts:

1. Header — ESC/POS text rendered natively by the printer. **Always in Dutch**, regardless of the website language the submitter used. Two lines: the author name (or `anoniem`), then the submission date and time.
2. Drawing — image bitmap, fetched from `/api/drawings/:id/png`, already dithered and sized.
3. Cut.

The submission timestamp is the row's `created_at` — the moment the user clicked submit, **not** when the print physically happens. A drawing submitted at 14:00 and printed at 17:00 still shows 14:00 on paper.

Format example:

```
Joost
2 jan 2026 14:23
```

- **Date**: `D mmm YYYY` — day without leading zero, short Dutch month name lowercase (`jan feb mrt apr mei jun jul aug sep okt nov dec`), 4-digit year.
- **Time**: `HH:MM`, 24-hour, separator is a single space after the date.

The agent formats this from the ISO `submitted_at` it receives — no locale handling needed on the web Pi.

The PNG stored under `/data/drawings/` is just the drawing. The header is never rasterized into it.

## Runtime notes (Node)

- Use `npm install` and `npm run`. Lockfile is `package-lock.json`. Node version is pinned in `.nvmrc` (currently 24).
- Use `node:sqlite` (built-in to Node 22+) for DB access, not `better-sqlite3` — keeps the no-native-compilation property the original Bun choice had.
- Dockerfiles use the official `node` image (pin a specific tag, e.g. `node:24-bookworm-slim`).
- Nuxt 4's default Nitro preset (`node-server`) is the runtime target; no special config needed in `nuxt.config.ts`.
- The Pi 4 is `arm64` — confirm the Node image tag includes arm64 support (the official `node` images do, but worth pinning explicitly).

## Future ideas (v2)

- **Live print preview from a Pi camera.** Add a Raspberry Pi camera to the printer Pi, pointed at the output slot. After a print finishes, the agent snaps a low-res photo and attaches it to the ack. The submitting user then sees their drawing on actual paper a few seconds after submitting. Does **not** replace the Flutter-uploaded gallery photos — purely a fast-feedback layer to close the perception gap introduced by the queued/async submit model.

## Open items

- Decide rate-limit policy on `POST /api/drawings` (per-IP per-day cap).
- Decide retry ceiling: how many `attempts` before a job is marked `failed`.
- Optional `/admin` page later: queue depth, last ack timestamp, list of submissions, manual reprint button.
- Register a fresh domain for the project. Caddy site config follows from that.
- Repo shape: likely a monorepo with `apps/web`, `apps/print-agent`, `apps/uploader`, but not locked in.
