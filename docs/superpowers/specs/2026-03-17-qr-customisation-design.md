# QR Code Customisation — Design Spec

**Date:** 2026-03-17  
**Status:** Approved  
**Task:** qrky-7qp

---

## Overview

Allow users to customise the appearance of their QR codes from the existing edit page at `/dashboard/urls/[uuid]/qr/edit`. Settings are persisted to the database and applied on every render of `/qr/[uuid]`.

---

## Decisions Made

| Decision | Choice |
|---|---|
| Layout | Single page: settings left, live preview right |
| Preview behaviour | Live as you type (stateless preview API route) |
| Settings exposed | Foreground colour, background colour, corner radius, logo (upload or QRky default), logo scale |
| Logo storage | Supabase Storage bucket (`qr-logos`) |
| Logo fallback | Always show a logo — custom upload or QRky default, never blank |
| Logo removal | Not supported — user can replace custom logo (reverts to QRky default) |
| Settings persistence | Saved to `qr_codes.settings` JSON column, applied on every `/qr/[uuid]` render |
| UI components | DaisyUI throughout |

---

## Settings Schema

Settings stored in `qr_codes.settings` (existing JSONB column):

```json
{
  "fgColor": "#000000",
  "bgColor": "#ffffff",
  "cornerRadius": 0.45,
  "logoUrl": null,
  "logoScale": 0.25
}
```

- `fgColor` — hex string, default `#000000`
- `bgColor` — hex string, default `#ffffff`
- `cornerRadius` — float 0–0.5, default `0.45`
- `logoUrl` — Supabase Storage public URL or `null` (null = use QRky default logo from `/public/qrky-logo.svg`)
- `logoScale` — float 0.10–0.30, default `0.25`

No database migration needed for the settings column — it already exists. A migration is needed only for the Supabase Storage bucket.

---

## Architecture

### 1. Supabase Storage Bucket

- Bucket name: `qr-logos`
- Public read access (URLs embedded in QR renders must be fetchable server-side)
- Write/delete scoped to authenticated owner via RLS
- File path pattern: `{user_id}/{qr_code_id}.{ext}`
- Accepted formats: SVG, PNG, JPG/JPEG
- Max file size: 500 KB (enforced client-side and via storage policy)

### 2. Stateless Preview Route — `GET /api/qr/preview`

A new Next.js API route that accepts settings as query parameters and returns a JPEG without touching the database. Used for live-as-you-type preview.

Query params:
- `fgColor` — hex (default `#000000`)
- `bgColor` — hex (default `#ffffff`)
- `cornerRadius` — float 0–0.5 (default `0.45`)
- `logoUrl` — must be either the literal string `default` (use QRky logo) or a URL that starts with `${NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/qr-logos/`. Any other value is rejected with 400 to prevent SSRF.
- `logoScale` — float 0.10–0.30 (default `0.25`)
- `data` — the URL to encode (required)

The existing `generateQrCode` logic in `src/app/qr/[uuid]/route.ts` must be extracted into a shared utility (`src/lib/qrcode/generate.ts`) and reused by both this route and the existing `/qr/[uuid]` route.

**Logo handling in the renderer:**
The current `QRkySVG.getLogo()` uses `readFileSync` (filesystem only). It must be extended to accept an in-memory `Buffer` as an alternative to a file path, so logos fetched from Supabase Storage (or the default from disk) can be passed through without writing temp files.

### 3. QR Render Route — `GET /qr/[uuid]`

Updated to read `settings` from the `qr_codes` row and pass them to `generateQrCode`. Falls back to defaults if settings are null or a field is missing.

### 4. Edit Page — `/dashboard/urls/[uuid]/qr/edit`

**Server component** — fetches `url_object` and `qr_code` (including `settings`) from Supabase, passes to a client form component.

**Client form component** (`QrEditForm`) — `"use client"`, handles:
- Colour pickers for fg/bg (HTML `<input type="color">` wrapped in DaisyUI `input input-bordered`)
- Corner radius range slider (`range range-primary range-xs`)
- Logo section:
  - Shows current logo thumbnail (custom or QRky default)
  - `Replace` button reveals a `file-input file-input-bordered file-input-xs` for upload
  - Logo scale range slider (`range range-primary range-xs`, 10–30%)
- Live preview `<img>` that calls `/api/qr/preview?...` with debounced updates on every setting change
- `Save Changes` button — calls a server action `updateQrCode`
- `Cancel` button — navigates back to `/dashboard/urls`

**Server action** `updateQrCode`:
1. Validate all inputs
2. If a new logo file is provided: upload to Supabase Storage at `{user_id}/{qr_code_id}.{ext}`, delete old file if replacing
3. Update `qr_codes.settings` with new values
4. `revalidatePath("/dashboard/urls")`
5. Redirect to `/dashboard/urls`

### 5. Logo Upload Server Action `uploadQrLogo`

Called **inside `updateQrCode`** — not independently from the client. Upload happens atomically as part of save:
1. Validate file type (SVG/PNG/JPG) and size (≤ 500 KB)
2. Upload to `qr-logos` bucket at `{user_id}/{qr_code_id}.{ext}` (overwrites any existing file at that path)
3. Return the public URL

Using a fixed path per QR code (`{user_id}/{qr_code_id}.{ext}`) means uploading a new logo always overwrites the old one — no orphaned files and no explicit delete step needed. If the extension changes (e.g. replacing a PNG with an SVG), the old file is left in storage but the `logoUrl` in settings will point to the new one. This is acceptable — orphaned files of a different extension are low-risk and can be cleaned up by a periodic job if needed.

---

## Component Structure

```
src/
  app/
    api/
      qr/
        preview/
          route.ts              # NEW — stateless preview endpoint
    dashboard/
      urls/
        [uuid]/
          qr/
            edit/
              page.tsx          # UPDATE — pass settings to form
              actions.ts        # UPDATE — implement updateQrCode
              components/
                form/
                  qr-edit-form.tsx   # NEW — client form component
    qr/
      [uuid]/
        route.ts                # UPDATE — use settings from DB
  lib/
    qrcode/
      generate.ts               # NEW — shared QR generation utility
      QRkySVG.ts                # UPDATE — accept Buffer for logo
      QRkyOptions.ts            # UPDATE — add logoBuffer option
supabase/
  migrations/
    YYYYMMDD_create_qr_logos_bucket.sql   # NEW
```

---

## Validation Rules

| Field | Rule |
|---|---|
| `fgColor` | Valid hex colour (`#rrggbb`), required |
| `bgColor` | Valid hex colour (`#rrggbb`), required |
| `cornerRadius` | Float, clamped to 0–0.5 |
| `logoUrl` | Valid URL or null. This is the value returned by `uploadQrLogo` (trusted — already validated at upload time). The preview route applies stricter SSRF validation on the same field when passed as a query param. |
| `logoScale` | Float, clamped to 0.10–0.30 |
| Logo file | Type: SVG/PNG/JPG only. Size: ≤ 500 KB |

---

## Testing Requirements

- [ ] Unit tests for `updateQrCode` action (valid input, invalid input, logo upload, fallback to default logo)
- [ ] Unit tests for `uploadQrLogo` action (type validation, size validation)
- [ ] Unit tests for `generate.ts` utility (settings applied correctly, defaults applied when fields missing)
- [ ] Unit tests for `QRkySVG` buffer-based logo path
- [ ] Component test for `QrEditForm` (renders with settings, preview URL updates on change)
- [ ] Test for `/api/qr/preview` route (returns JPEG, respects params, defaults on missing params)
- [ ] All quality gates passing: `pnpm test`, `pnpm build`, `pnpm lint`

---

## Task Breakdown (Suggested)

This feature should be split into the following sub-tasks:

1. **Extract QR generation into shared utility** — `src/lib/qrcode/generate.ts`, update `QRkySVG` to accept logo buffer
2. **Create stateless preview API route** — `GET /api/qr/preview`
3. **Supabase Storage bucket + migration** — `qr-logos` bucket with RLS
4. **Implement `updateQrCode` server action** — settings validation, logo upload, DB update
5. **Build `QrEditForm` client component** — DaisyUI form, live preview, colour pickers, sliders, logo upload
6. **Update `/qr/[uuid]` render route** — read and apply settings from DB

---

## Out of Scope

- Multiple logos per QR code
- Animated QR codes
- Custom finder pattern (corner square) styles
- Batch customisation across multiple QR codes
- Sharing / exporting custom QR templates
