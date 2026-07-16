# Respira Build Handover for Codex

**Project:** Respira (openrespira.org)  
**Repo:** `~/Documents/GitHub/respira`  
**Live:** openrespira.org (git-connected Cloudflare Pages)  
**Updated:** 2026-07-14  

---

## Quick Start

1. **Deploy is automatic**: `git push origin main` → Cloudflare builds and deploys in ~1–2 min. No manual upload step.
2. **Development**: Pages Functions + D1 database are already wired. Use `wrangler.toml` (ignored in git) for local dev; production bindings are set in Cloudflare dashboard.
3. **Current blockers**: Two one-time Cloudflare dashboard steps remain (see [Production Setup Still Needed](#production-setup-still-needed)).

---

## Project State

### What's DONE ✅

The rebuild is ~85% complete. All core flows are functional:

#### Pages & Routes (ALL 6 missing routes built)
- **Homepage** (`/`) — 4-panel split-door entry point (breathe/move/listen/teach), persistent nav, footer ecosystem links
- **Room Pages** (`/radio`, `/voices`, `/shelf`) — each a self-contained "room" with dark left rail, topbar, signature color
- **Practice Ecosystem** (`/find`, `/open-floor`) — searchable directory + contributor intake, write to D1
- **Studio** (`/studio`) — teaching workspace with class builder, runner, room intake modal, status lookup, admin panel
- **Shop** (`/goods`, `/poster`) — storefronts using persistent `respira_cart_v1` cart
- **Subpages** (`/about`, `/support`, `/help`) — all built, one-time donations live on `/support`

#### Commerce ✅
- Client-side cart in `index.html` + `/api/checkout` Stripe Function
- Prices server-side in `checkout.js` `CATALOG`
- Stripe live key already set in Cloudflare (user configured it)
- `/api/checkout` returns real `cs_live_` Checkout Session URLs

#### Database (D1) ✅
- D1 instance `respira_db` created (uuid `a4fc6375-9bc6-470c-a3f0-21283a415957`, ENAM)
- Schema applied: `open_floor_submissions`, `directory_submissions`, `room_requests` tables
- Functions read from `env.DB` — pattern proven (validate → insert → return ID → notify)
- Local dev: `wrangler.toml` binding set to `respira_db` (do NOT commit)

#### Studio Workflows ✅
- **Class builder**: name, length, discipline, music, timeline, section editor (retained from original, working)
- **Teaching runner**: now a teleprompter (cue-first layout, auto/manual cue advance, section nav, pause, refresh-safe, local session storage)
- **Room intake**: modal capture → `/api/room.js` → D1 `room_requests` → ROOM-* ID
- **Room status lookup**: GET `/api/room-status` by id+email → returns 8-stage lifecycle, current stage lit
- **Admin panel** (`/studio/admin`, dark, noindex): token-gated view/status-edit for rooms, open-floor, directory

#### Visual & Brand ✅
- **Door** (homepage entry): 4 panels (breathe cream, move sage, listen lavender, teach caramel), full-width fixed header
- **Room colors**: breathe=cream, flow=green, radio=lavender, voices=rose, shelf=slate, studio=dune (warm caramel)
- **All subpages** recolored dune (warm practice/ecosystem room, no cream/lavender)
- **PWA**: `manifest.json` + `sw.js` + install prompt on all 11 pages via `/chrome.js`
- **Reduced motion** + a11y pass completed

#### Persistence ✅
- `studio_classes_v1` — saved class library
- `respira_cart_v1` — persistent cart across pages
- `studio_live_v1` — running session state (resume-on-refresh)
- `studio_room_v1` — selected studio palette

---

## Production Setup Still Needed ⚠️

**Two one-time Cloudflare dashboard tasks** (then redeploy):

### 1. D1 Database Binding
- **Path**: Cloudflare → respira-5cr project → Settings → Functions → D1 database bindings
- **Action**: Add binding: variable name `DB` → database `respira_db`
- **Verify after redeploy**: POST to `/api/directory` or `/api/open-floor` (not via UI, via curl/Postman)
  - Expected: `200 { "id": "DIR-..." }` or `{ "id": "OF-..." }`
  - Current: `503` (until binding is added + build runs)

### 2. Admin Token
- **Path**: Cloudflare → respira-5cr → Settings → Environment variables
- **Action**: Add variable: `ADMIN_TOKEN` → any secret string (e.g., `dHJlUb...` 32+ chars recommended)
- **Verify**: `/studio/admin?token=<ADMIN_TOKEN>` should load the admin panel (token in URL for now; magic-link auth is TODO)
- **Current**: `/studio/admin` returns `403` until token is set

Once both are added, redeploy (git push or click "Redeploy" in Cloudflare Pages dashboard).

---

## File Structure

```
respira/
├── index.html              # Homepage (4-panel door entry point)
├── .html files             # /about, /support, /help, /goods, /poster, /find, /open-floor (all root level)
├── schema.sql              # D1 schema (3 tables: submissions, rooms)
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
├── chrome.js               # Injected on all pages (PWA, footer, share, navigator)
│
├── functions/api/
│   ├── checkout.js         # Stripe Checkout Session creator (CATALOG server-side)
│   ├── open-floor.js       # POST validate+insert open-floor submission → D1 → notify
│   ├── directory.js        # POST validate+insert directory submission → D1 → notify
│   ├── room.js             # POST validate+insert room request → D1 → notify
│   ├── room-status.js      # GET room status by id+email (8-stage lifecycle)
│   ├── admin.js            # Token-gated GET (list) / POST (update status)
│   └── stripe-webhook.js   # Signature-verified stub (needs STRIPE_WEBHOOK_SECRET, currently unused)
│
├── studio/
│   └── index.html          # /studio — workspace (app-shell + builder/runner/room/admin)
│
├── radio/, voices/, shelf/
│   └── index.html          # Room pages (cross-room nav rail, topbar, signature color)
│
├── wrangler.toml           # LOCAL dev config (gitignored, binds DB → respira_db)
├── .gitignore              # Ignores wrangler.toml + node_modules
└── HANDOVER.md             # This file
```

---

## Key Technical Decisions

| Decision | Rationale | Trade-off |
|----------|-----------|-----------|
| D1 (SQLite) + Pages Functions + magic-link auth | Native to Pages, no new vendor, proven pattern (validate→insert→ID) | Magic-link still TODO; admin currently URL-token-gated |
| Static HTML files (no framework) | Minimal complexity, fast load, SEO-friendly | Manual HTML (no components), no HMR; dev server for `functions/` testing only |
| Client-side cart (localStorage) | Persistent across pages, no backend state | Can't recover if user clears localStorage; stripe Checkout Session is source-of-truth server-side |
| Teleprompter teaching mode (cue-first) | Teacher sees next cue before starting, uncluttered during teach | No real-time MIDI/timecode sync (sync'd manually per cue); no playback preroll |
| Room colors per page | Clear visual hierarchy + "earn their room" feel | Some color variety (e.g., lavender used twice) may need future consolidation |
| Door as home + nav | Single entry point, four clear choices, no landing-page bounce | Replaces the old 3-card entry selector; users new to respira see door first |

---

## Remaining Work (Priority Order)

### BLOCKED UNTIL PRODUCTION SETUP ⚠️
- D1 binding (Forms won't accept: `/api/directory`, `/api/open-floor` return 503)
- Admin token (admin panel loads empty/403)

### PHASE: Polish & Close (after production setup)

1. **Teaching-mode polish** (§9)
   - Bigger thumb controls in runner
   - ±1 min live timer adjust
   - Next-cue preview
   - Screen wake-lock
   - Confirm-before-end

2. **Magic-link auth** (§28)
   - `/api/auth.js` → POST email → send link → click link + token → set session
   - Replace URL-token admin gate with session-based
   - "Look up your room" flow for requesters (don't need account, just id+email)

3. **Left-rail nav for studio** (optional polish)
   - Studio currently has cards/anchors; could add persistent rail like rooms
   - Not critical; current dashboard is usable

4. **Translation API** (deferred decision)
   - Poster custom-input profanity/slur filter is WIRED (word-boundary, no false positives)
   - Translation auto-apply GATED on user's API choice (DeepL/Google vs curated)
   - Also used for poster 'wrong artwork' issue (unclarified)

5. **Notes & known issues**
   - Poster frame-maker 'wrong artwork' = unclear root cause; needs UX investigation
   - Statuses in D1 default to 'submitted' until admin advances them (chain: submitted→building→ready→live)
   - `respira_cart_v1` has no recovery if user clears localStorage (OK for MVP)
   - Browser-pane screenshots of scrolled/fixed content are flaky — verify via DOM inspection (elementFromPoint/getComputedStyle) instead

---

## Deployment & Verification Workflow

### Local Development
```bash
# Install & run (builds Functions locally)
npm install
npm run dev

# Watch Functions rebuild
wrangler deploy --dry-run

# Test Functions locally (if server running)
curl http://localhost:8787/api/directory \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com",...}'
```

### Pushing to Production
```bash
git add .
git commit -m "message"
git push origin main

# Wait ~1–2 min, then verify
curl -L https://openrespira.org/  # -L follows 308 redirects
curl -L https://openrespira.org/find
curl https://openrespira.org/studio/admin  # Should load (with 403 until token set)
```

### Verification Checklist
- **Door opens**: all 4 panels (breathe/move/listen/teach) clickable, colors distinct, no console errors
- **Room colors applied**: /radio (lavender), /voices (rose), /shelf (slate), /studio (dune), /find (dune)
- **Forms work**: submit /open-floor form → expect 200 + ID (or 503 if D1 binding missing)
- **Cart persists**: add item on /poster → navigate to /goods → cart still there
- **Radio plays**: /radio?play=1 auto-starts station
- **Studio teaches**: open class → review → start → cues advance
- **Admin visible**: /studio/admin?token=<YOUR_TOKEN> loads panel (after token set)
- **PWA installable**: chrome dev tools → application tab → manifest loads, install prompt fires

---

## Key Gotchas & Constraints

### Don't
- Commit `wrangler.toml` with local dev bindings (it's gitignored for a reason — prod uses different config)
- Use cream backgrounds except on the breathing room (cream = breathing experience only; subpages = dune)
- Show fake stats, testimonials, or "we'll be in touch" — only show success after data is saved
- Invent new routes or forms without D1 table + Function to back them
- Hard-code Stripe keys; always read from env (Cloudflare dashboard sets them)

### Do
- Use clean URLs (`/poster`, not `/poster.html`); Cloudflare 308-redirects them
- Test Forms locally before pushing (POST to `localhost:8787/api/*`)
- Use `navigator.share()` with a dark fallback modal (for in-page sharing)
- Unify fragmented audio (homepage has ~13 refs, radio 3, studio 2 — one global controller TBD)
- Respect reduced-motion + a11y (already done, maintain)
- Use `respiraShare()` for homepage/radio/studio share flows (cross-page consistency)

### Current Constraints
- No framework; manual HTML files (good for simplicity, not for DRY)
- D1 tables are the ONLY persistent state (localStorage for UI state only, D1 for user data)
- Notifications via Formspree (not Resend yet; Resend TBD per user's decision)
- Stripe keys in Cloudflare env (never in code)

---

## Common Debugging Steps

| Issue | Check |
|-------|-------|
| Form returns 503 | D1 binding not added / not redeployed. Check Cloudflare → Settings → Functions → D1 bindings. |
| Admin panel won't load | ADMIN_TOKEN env var not set. Cloudflare → Settings → Environment variables → add ADMIN_TOKEN. |
| Cart items disappear on refresh | `respira_cart_v1` localStorage cleared; expected, not a bug. |
| `/poster` returns empty 308 | Using curl without `-L` flag; follow redirects with `-L` or fetch `/poster` directly (not `/poster.html`). |
| Cues not auto-advancing in runner | Check browser DevTools console for errors; verify `parseSectionCues()` logic if section has no explicit `mm:ss`. |
| Room colors not applied | Clear browser cache; check CSS vars (`--st-room-bg`, `--st-room-bar`, etc.) are set. |
| PWA won't install | Manifest not loading; check `/manifest.json` exists and chrome.js injected `<link rel=manifest>`. |

---

## Handoff Notes for Codex

### What to Prioritize
1. **Unblock production** — add D1 binding + admin token (instant unblock for all intake forms)
2. **Validate everything works end-to-end** — test open-floor form → D1 insert → success screen
3. **Teaching-mode polish** (§9) — bigger controls, timer adjust, wake-lock
4. **Magic-link auth** (§28) — replace URL tokens with session-based flow

### What's Safe to Defer
- Translation API decision (gated, doesn't block MVP)
- Left-rail nav for studio (nice-to-have, current dashboard works)
- Poster 'wrong artwork' investigation (unclarified, low priority)

### Logs & Monitoring
- **Cloudflare Pages dashboard** → Deployments tab shows each git push + build logs
- **Browser DevTools console** → all major flows log state (door, room colors, class save, form submit)
- **Network tab** → watch `/api/*` responses for 503 (missing env/binding) vs 200 (success)

---

## Contact & Questions

- **Repo**: `surulery-pixel/respira` on GitHub
- **Live**: openrespira.org (also respira-5cr.pages.dev)
- **Deployment**: git-connected Cloudflare Pages (push = deploy)
- **Brief**: 47-section rebuild focusing on no fake flows, every form saves real data, studio as the growth lever

---

**Last updated**: 2026-07-14 | **Status**: ~85% complete, unblocked after production setup
