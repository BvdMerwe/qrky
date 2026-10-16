# GDPR Compliance + WCAG 2.1 AA — Design Spec

**Issue:** qrky-s31 (epic) — task breakdown lives in beads (`bd show qrky-s31`)  
**Date:** 2026-04-13  
**Revised:** 2026-10-17 (qrky-3p9)  
**Status:** Approved, revised after refinement  
**Author:** PO  

> **Revision note (2026-10-17):** The original spec was checked against the code and corrected. Changes: `profiles` table does not exist so consent uses a new `user_consents` table; account deletion must also remove Supabase Storage files; consent state moved to a client `ConsentProvider` (Server Components cannot hold state and reading the session in the root layout would make every route dynamic); real Supabase cookie names; `src/proxy.ts` (not `middleware.ts`) and Next 16; sign-out ordering fixed; axe tags extended to WCAG 2.1 and jsdom contrast limitation noted; audit scope trimmed to pages that render UI; theme overrides go in `globals.css` (Tailwind v4 + DaisyUI 5, no `tailwind.config.ts`).

---

## Problem Statement

QRky operates in the EU. It must comply with:

- **GDPR** — user data rights, consent for analytics, data retention transparency
- **ePrivacy Directive** — cookie/tracking disclosure and consent
- **European Accessibility Act (EAA)** — WCAG 2.1 AA compliance (enforceable from June 2025)

Currently: no account deletion flow, no analytics consent mechanism, inaccurate cookie disclosure, no a11y audit or regression tooling.

---

## Out of Scope

- i18n / translations (separate future issue)
- Email-based deletion confirmation flow
- Third-party cookie consent (no third-party tracking cookies in use)
- WCAG 2.2 or AAA compliance

Tracked separately (see "Follow-ups"): self-serve data export, visits-logging disclosure review, splitting the service-role Supabase client.

---

## Section 1: Account Deletion (GDPR Art. 17 — Right to Erasure)

### User Story

As a registered user, I want to permanently delete my account and all associated data so that I can exercise my right to erasure under GDPR.

### Data Removal State (audited)

Database FK cascades are already in place — no migration needed for deletion:

| FK | Cascade |
|----|---------|
| `url_objects.user_id` → `auth.users.id` | `ON DELETE CASCADE` ✅ |
| `aliases.url_object_id` → `url_objects.id` | `ON DELETE CASCADE` ✅ |
| `qr_codes.url_object_id` → `url_objects.id` | `ON DELETE CASCADE` ✅ |
| `visits.url_object_id` → `url_objects.id` | `ON DELETE CASCADE` ✅ |
| `visits.alias_id` → `aliases.id` | `ON DELETE CASCADE` ✅ |
| `visits.qr_code_id` → `qr_codes.id` | `ON DELETE CASCADE` ✅ |
| `user_consents.user_id` → `auth.users.id` (new, Section 2) | `ON DELETE CASCADE` ✅ |

**Not covered by cascades:** Supabase Storage. Uploaded QR logos live in the public bucket `qr-logos` under `{user_id}/*`. These files must be deleted explicitly, otherwise they remain publicly reachable after the account is gone.

### Design

**Location:** New "Danger Zone" section at the bottom of `src/app/dashboard/user/page.tsx`

**Flow:**
1. User clicks "Delete my account" button (styled destructively with `btn-error`)
2. Modal opens with explicit warning:
   > "This will permanently delete your account, all shortened URLs, QR codes, aliases, and analytics data. All your links will stop working immediately. This cannot be undone."
3. User must type `DELETE` (case-sensitive) into a confirmation input to enable the submit button
4. On submit: server action `deleteAccount` in `src/app/dashboard/user/actions.ts` is called
5. Server action:
   1. Reads the current user via `createClient()` + `auth.getUser()`. Null user: return `{ success: false }` (defensive; no redirect)
   2. Lists and removes all objects under `qr-logos/{user.id}/`. On failure, **abort before deleting the user** and return an error so the user can retry (otherwise orphaned public files remain with no owner)
   3. Calls `supabase.auth.admin.deleteUser(user.id)`. FK cascades remove all rows
   4. Clears session cookies with `supabase.auth.signOut({ scope: 'local' })`; any failure is ignored
   5. `redirect('/')`

Note: `createClient()` in `src/lib/supabase/server.ts` is already constructed with `SUPABASE_ADMIN_KEY` (service role), so `auth.admin.*` is available on it. This is a known security smell tracked as a follow-up; no separate admin client is introduced here. The user id always comes from the session, never from client input.

**Focus management (modal):**
- When the modal opens, focus moves to the confirmation input
- Focus is trapped within the modal while it is open (tab cycles through modal elements only)
- Escape and Cancel close the modal
- On close (cancel or error), focus returns to the "Delete my account" trigger button
- Modal uses `role="dialog"` (or native `<dialog>` + `showModal()`), `aria-modal`, `aria-labelledby`, `aria-describedby`

**Error handling:**
- If storage cleanup or `deleteUser` fails: surface the error inside the modal (`role="alert"`), do not redirect, allow retry
- If `deleteUser` succeeds but the local `signOut` fails: redirect to `/` anyway. The auth user no longer exists, so the leftover JWT is rejected on the next request
- Auth check: `src/proxy.ts` already protects all `/dashboard` routes; the action still guards against a null user and returns early without redirect

**Privacy policy update (`src/app/privacy/page.tsx`):**
- Section 6 (Data Retention): replace the vague "You can delete your account and associated data at any time" with:
  > "You can permanently delete your account from your [account settings](/dashboard/user). Deletion immediately and irreversibly removes your account, all shortened URLs, QR codes, aliases, uploaded logos, and analytics data. Your links will stop working immediately after deletion."

### Acceptance Criteria

- [ ] "Danger Zone" section visible at bottom of `src/app/dashboard/user/page.tsx`
- [ ] Deletion modal requires typing `DELETE` before submit is enabled
- [ ] Modal traps focus when open; returns focus to trigger button on close
- [ ] `deleteAccount` removes `qr-logos/{user_id}/*` before deleting the user; storage failure aborts without deleting the user
- [ ] `deleteAccount` calls `supabase.auth.admin.deleteUser(userId)` with the session user id
- [ ] All associated data deleted via FK cascade (verified by unit test mocking `admin.deleteUser`)
- [ ] User is signed out and redirected to `/` after deletion; sign-out failure does not block the redirect
- [ ] Error displayed in modal on failure; no redirect occurs; retry is possible
- [ ] Privacy policy Section 6 updated with accurate deletion description and link to `/dashboard/user`
- [ ] `pnpm lint && pnpm test && pnpm build` pass

---

## Section 2: Consent Banner, Analytics + Policy Versioning (GDPR Art. 6/7 + ePrivacy)

### Context

- QRky uses self-hosted Umami for analytics on all pages (authenticated + unauthenticated)
- Currently injected unconditionally in `src/app/layout.tsx` as a `<script>` tag gated only on `NODE_ENV === 'production'`
- Umami is cookieless but collects IP addresses and geo data (`DISABLE_GEO_IP` is off) — this is personal data under GDPR
- Since personal data is collected, explicit consent is required before the Umami script loads
- Supabase Auth session cookies are strictly necessary — no consent required for these
- The root layout (and footer) are Server Components. They cannot hold React state, and reading the session in the layout would force every route to render dynamically (breaking static pages such as the homepage). Consent state therefore lives in a client provider that fetches logged-in consent after mount.

### Policy Versioning

**Location:** New file `src/lib/policy.ts`

```ts
// Bump this string on any material change to the privacy or cookie policy.
// Format: YYYY-MM-DD of the change.
export const POLICY_VERSION = "2026-04-13";
```

- Privacy policy and cookie disclosure share this version string
- `src/app/privacy/page.tsx` and `src/app/terms/page.tsx` import `POLICY_VERSION` and display it as the "last updated" date, replacing the current `new Date().toLocaleDateString(...)` call
- Bumping the constant re-prompts every user (anonymous and logged in) whose stored version differs; this is intended

### Consent Storage

**Anonymous visitors (localStorage):**
- Key `qrky_analytics_consent`: `"accepted" | "declined"`
- Key `qrky_policy_version`: string matching the `POLICY_VERSION` at decision time
- Read/written only on the client (`ConsentProvider`)

**Logged-in users (Supabase `user_consents` table — new):**

No `profiles` table exists in this project, so a dedicated table is used. It cascades with the auth user, so account deletion erases it, and it doubles as auditable proof of consent.

**Migration:** `supabase/migrations/YYYYMMDDHHMMSS_create_user_consents.sql`
```sql
CREATE TABLE public.user_consents (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  analytics_consent boolean NOT NULL,
  policy_version_consented text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;
-- Policies: authenticated users may SELECT / INSERT / UPDATE only where auth.uid() = user_id.
-- Follow the existing DROP POLICY IF EXISTS + CREATE POLICY and SET ROLE postgres pattern.
```
No row means "undecided".

### Server Actions (`src/app/actions/consent.ts`, `'use server'`)

- `getAnalyticsConsent()` → `{ accepted: boolean; policyVersion: string; updatedAt: string } | null`. Null for anonymous callers or when no row exists
- `updateAnalyticsConsent(accepted: boolean)` → `{ success: boolean }`. Upserts the session user's row with `policy_version_consented = POLICY_VERSION` and `updated_at = now()`. Anonymous caller: `{ success: false }`, no error. DB failure: `console.error`, `{ success: false }`, never throws. Callers treat failure as non-fatal and keep the localStorage value (consent is not safety-critical)

### Consent Provider and Banner

**`src/components/ui/consent/ConsentProvider.tsx`** (`"use client"`), mounted in `src/app/layout.tsx` around the page content and footer. The layout itself stays a Server Component and does not read cookies or the session. The provider exposes `useConsent()` → `{ consent, openPreferences, accept, decline }` and renders the banner and the Umami script.

**Initialisation and sync (all in the provider, after mount):**
1. Read localStorage in `useEffect` (avoids hydration mismatch; render nothing consent-related until hydrated)
2. Call `getAnalyticsConsent()`:
   - Non-null DB value: it wins. Overwrite localStorage and state
   - Null DB value and localStorage holds a decision: call `updateAnalyticsConsent` to propagate prior anonymous consent (no-op for anonymous callers)
3. Show the banner when consent is null OR the stored policy version differs from `POLICY_VERSION`, or when `openPreferences()` was called

**On decision (banner, footer re-open, or dashboard toggle):**
- Write localStorage immediately, update state, call `updateAnalyticsConsent` (ignore failure), hide the banner

**`src/components/ui/consent/ConsentBanner.tsx`:** fixed bottom-of-screen bar (not an overlay).
- Copy: "We use self-hosted analytics to understand how QRky is used. No third-party tracking."
- Link to `/privacy`
- Two buttons, "Accept analytics" / "Decline", with equal visual weight (no dark patterns)
- No dismiss/close button — a choice must be made

**Umami script:**
- Unconditional `<script>` and the `ENV === 'production'` `<head>` block are removed from `src/app/layout.tsx`
- The provider renders `<Script src="…" data-website-id="…" strategy="afterInteractive" />` (`next/script`) only when consent is `accepted` and `NODE_ENV === 'production'`. URL and website id move to a single constants location
- Declined or null: no script in the DOM. If consent flips from accepted to declined, an already-executed script cannot be unloaded; reload the page (or state in the UI that it applies on next load)

### Consent Management

**Everyone — footer "Cookie Preferences" link:** `src/components/ui/footer.tsx` gets a button (styled like the other links) that calls `openPreferences()`. It works for anonymous and logged-in users on every page and overwrites the previous decision on next interaction. The footer remains static apart from this small client piece.

**Logged-in users — `src/app/dashboard/user/page.tsx`:** new "Analytics consent" section showing current status (Accepted/Declined), policy version consented to, last updated time, and a "Change to: Accept/Decline" button using the same provider/action as the banner.

### Privacy Policy Updates (`src/app/privacy/page.tsx`)

**Section 6 (Data Retention):** updated per Section 1.

**Section 8 (Cookies and Tracking Technologies) — replace with:**

> QRky uses a session cookie set by Supabase Auth (named `sb-<project-ref>-auth-token`, possibly split into numbered chunks). It is strictly necessary for authentication and cannot be declined. No third-party tracking cookies are used.
>
> We use self-hosted Umami analytics. Umami is cookieless. When you consent to analytics, Umami collects: page views, referrer URLs, browser and device type, IP addresses, and approximate geographic location (country/city). This data is stored on our own infrastructure and is not shared with third parties.
>
> Analytics only load with your explicit consent. You can change your consent at any time via the "Cookie Preferences" link in the footer, or in your [account settings](/dashboard/user) if logged in.

The real cookie names must be verified in a browser before publishing. `@supabase/ssr` does **not** use `sb-access-token` / `sb-refresh-token`.

**Section 7 (Your Rights):** access and portability remain "contact us" until the data export follow-up lands; mention the stored consent record for logged-in users.

**Last updated date:** replace `new Date().toLocaleDateString(...)` with `POLICY_VERSION`. Bump `POLICY_VERSION` in the same change as these copy edits.

### Acceptance Criteria

- [ ] `src/lib/policy.ts` exports `POLICY_VERSION` constant
- [ ] Privacy and terms pages display `POLICY_VERSION` as last updated date (not `new Date()`)
- [ ] Unconditional Umami `<script>` removed from `src/app/layout.tsx`; the layout does not read cookies or the session (static pages stay static)
- [ ] Migration creates `user_consents` with RLS (own row only) and cascade on auth user delete
- [ ] `getAnalyticsConsent` and `updateAnalyticsConsent` exist in `src/app/actions/consent.ts` with the behaviour above
- [ ] Banner shown when consent is null or stored policy version mismatches `POLICY_VERSION`
- [ ] Banner cannot be dismissed without accepting or declining
- [ ] Umami `<Script>` (next/script) only rendered after consent accepted; absent from DOM when declined or null
- [ ] On mount with non-null DB consent: localStorage written to match DB
- [ ] On mount with null DB consent but localStorage set: `updateAnalyticsConsent` called to propagate to DB
- [ ] Failed `updateAnalyticsConsent` is silent; localStorage value is kept
- [ ] "Cookie Preferences" footer link re-opens the banner for anyone, regardless of current consent
- [ ] Consent section in `/dashboard/user` shows status, version, timestamp and allows changing
- [ ] Privacy policy Sections 6, 7, 8 updated with accurate copy and verified cookie names
- [ ] `pnpm lint && pnpm test && pnpm build` pass

---

## Section 3: WCAG 2.1 AA Audit + Fix

### Legal Context

The European Accessibility Act (EAA) requires WCAG 2.1 AA compliance for digital services operating in the EU. Enforcement began June 2025.

### Tooling

**`@axe-core/react` (dev dependency):**
- Create `src/components/dev/AxeProvider.tsx` — a Client Component (`"use client"`) that initialises axe in development only:
  ```tsx
  "use client";
  import { useEffect } from "react";
  export function AxeProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
      if (process.env.NODE_ENV !== "production") {
        Promise.all([
          import("@axe-core/react"),
          import("react"),
          import("react-dom"),
        ]).then(([axe, React, ReactDOM]) => {
          axe.default(React, ReactDOM, 1000);
        });
      }
    }, []);
    return <>{children}</>;
  }
  ```
- Wrap `{children}` in `src/app/layout.tsx` with `<AxeProvider>` — surfaces violations in the browser console during development without affecting production builds or RSC
- Verify `@axe-core/react` works with React 19.2; if it does not, fall back to `axe-core` directly and note why in a comment

**`vitest-axe` (dev dependency):**
- Extend expect with the vitest-axe matchers in `./vitest.setup.ts` (already referenced by `vitest.config.ts`). The import path differs between vitest-axe versions; check current docs. Add TypeScript types for `toHaveNoViolations`
- Configure the WCAG 2.1 AA ruleset using axe's tag system:
  ```ts
  import { configureAxe } from "vitest-axe";
  // wcag2a/wcag2aa = WCAG 2.0; wcag21a/wcag21aa add the 2.1-specific rules
  configureAxe({
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
    rules: { "color-contrast": { enabled: false } }, // jsdom has no layout/colour engine
  });
  ```
- **Contrast cannot be tested in jsdom.** `color-contrast` is therefore disabled in vitest and covered by running `@axe-core/react` in a real browser during the audit plus a manual check of theme tokens
- Each page test (`*.test.tsx`) gains:
  ```ts
  import { axe } from "vitest-axe";
  // after render:
  const results = await axe(container);
  expect(results).toHaveNoViolations();
  ```
  Where this fails on real violations before the fix work, mark the case `it.fails` with a TODO pointing at the audit so CI stays green, then enable it in the fix task

### Audit

The engineer runs `@axe-core/react` (browser) and `vitest-axe` against all pages first and records findings in `docs/a11y-audit-<date>.md` before writing fixes. The document lists every violation with its axe rule ID, impact, and affected component, plus the commands used.

**Audit scope (routes that render UI):**
- Auth: `/login`, `/register`, `/login/forgot-password`, `/login/reset-password`, `/email-verification-waiting`
- Dashboard: `/dashboard`, `/dashboard/user`, `/dashboard/urls`, `/dashboard/urls/new`, and the `[uuid]` sub-routes (`edit`, `alias/new`, `alias/edit`, `qr/new`, `qr/edit`, `analytics`)
- Public/marketing: `/`, `/privacy`, `/terms`, `/error`, `/500`, not-found
- `/q/[identifier]` only if it renders UI
- **Not in scope:** `/u/[identifier]` (immediate redirect) and `/qr/[uuid]` (route handler) render no UI
- New components: `ConsentBanner`, account deletion modal, dashboard consent section
- Manual: keyboard-only walkthrough of login and creating a URL, 320px / 200% zoom reflow, visible focus

**`ConsentBanner` a11y requirements:**
- Role: `role="region"` with `aria-label="Cookie preferences"` (a persistent informational region, not a dialog)
- All interactive elements focusable and operable via keyboard
- Announced by screen readers on first appearance (`aria-live="polite"` on the container)
- Focus is NOT trapped — non-modal bottom bar; tab order flows naturally
- When the banner disappears after a decision, focus is not forcibly moved

**Known violations (from code inspection — full list produced by audit):**

| File | Violation | Fix |
|------|-----------|-----|
| `src/app/dashboard/user/page.tsx` | `<span className="label"><TbMail/></span>` — icon-only label, no accessible text | Add `aria-label` to each input |
| `src/app/layout.tsx` | No skip-to-main-content link and no `<main>` landmark | Add `<a href="#main-content" className="sr-only focus:not-sr-only">Skip to main content</a>` before content; wrap page content in `<main id="main-content">` |
| `src/app/dashboard/urls/components/DeleteButton.tsx` | Icon-only button, no `aria-label` | Add `aria-label="Delete URL"` |
| New deletion modal (Section 1) | Focus trap required | Specified in Section 1 |
| All pages | Only the root `metadata.title` exists; sub-routes share it | Add `metadata` / `generateMetadata` per route; ensure titles are unique and descriptive |
| Form error messages | Errors not programmatically associated with inputs | `aria-describedby` on inputs referencing the error element `id`; `role="alert"` on errors |
| DaisyUI theme colours | Some may fail 4.5:1 contrast ratio | Check in browser; override failing tokens in the DaisyUI theme config in `src/app/globals.css` (Tailwind v4 + DaisyUI 5, there is no `tailwind.config.ts`) |

**Fix prioritisation:** Critical → Serious → Moderate → Minor (axe impact levels).

The engineer must fix ALL violations found in the audit, not only those listed above.

### Regression Prevention

- `vitest-axe` assertion in every page test file — new violations fail CI immediately
- WCAG 2.1 AA tags explicitly configured, not just the default axe ruleset
- `AxeProvider` surfaces violations (including contrast) in the browser console during development before they reach tests

### Acceptance Criteria

- [ ] `src/components/dev/AxeProvider.tsx` wraps children in `src/app/layout.tsx` (dev-only, dynamic import)
- [ ] `vitest-axe` configured in `vitest.setup.ts` with WCAG 2.1 AA tags
- [ ] Each page test file has `expect(results).toHaveNoViolations()`; no `it.fails` axe skips remain
- [ ] Audit findings recorded in `docs/a11y-audit-<date>.md`
- [ ] Zero axe violations across all audited pages
- [ ] Skip-to-main-content link in root layout; `<main id="main-content">` landmark
- [ ] All form inputs have programmatically associated labels (not icon-only)
- [ ] All icon-only interactive elements have `aria-label`
- [ ] Deletion modal traps focus; returns focus on close
- [ ] All page titles are unique and descriptive
- [ ] Form error messages associated with inputs via `aria-describedby`
- [ ] Colour contrast passes AA ratios (4.5:1 text, 3:1 UI), verified in a browser; token overrides in `globals.css` if needed
- [ ] `pnpm lint && pnpm test && pnpm build` pass

---

## Implementation Order

Matches the beads task dependencies under `qrky-s31`.

1. **A11y tooling** (`qrky-s31.9`) — vitest-axe, `AxeProvider`
2. **A11y audit** (`qrky-s31.10`) — existing pages, findings doc
3. **Policy versioning** (`qrky-s31.1`) and **`user_consents` migration** (`qrky-s31.2`) — independent of each other
4. **Consent server actions** (`qrky-s31.13`) — needs 1.1 and 1.2
5. **ConsentProvider + banner + Umami gating** (`qrky-s31.14`) — needs step 4
6. **Footer link + dashboard consent section** (`qrky-s31.15`) — needs step 5
7. **`deleteAccount` action** (`qrky-s31.6`) then **Danger Zone modal** (`qrky-s31.7`) — independent of the consent track
8. **Privacy policy copy + version bump** (`qrky-s31.16`) — after steps 6 and 7
9. **A11y fixes on existing pages** (`qrky-s31.11`) — needs the audit
10. **A11y verification of new UI** (`qrky-s31.17`) — banner, modal, dashboard consent section

---

## Follow-ups (separate tickets)

- `qrky-mk2` — self-serve data export (Art. 15/20)
- `qrky-efp` — review `visits` logging disclosure and legal basis
- `qrky-wli` — split service-role key from cookie-bound server Supabase client
- Once Stripe lands (`qrky-xxe.3`), `deleteAccount` must cancel the active subscription first; check whether public-API service keys (`qrky-80s`) need erasure too

---

## Technical Constraints

- Next.js 16 + React 19, App Router (`src/app/`); route protection in `src/proxy.ts`
- Tailwind v4 + DaisyUI 5 (theme in `src/app/globals.css`)
- Supabase Auth (SSR) — session cookies strictly necessary, not subject to consent
- `ConsentProvider` and `AxeProvider` are Client Components (`"use client"`); the root layout stays a Server Component and does not read the session
- `@axe-core/react` loaded via dynamic `import()` inside a `useEffect`
- Umami loaded via `next/script` with `strategy="afterInteractive"`, rendered by `ConsentProvider` only after consent
- No new npm packages for consent logic (implement in-house)
- Only new dependencies: `vitest-axe` and `@axe-core/react` (both dev-only)
- All quality gates must pass: `pnpm lint && pnpm test && pnpm build`
