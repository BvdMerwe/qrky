# QR Code Customisation Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow users to customise QR code appearance (colours, corner radius, logo) from the edit page, with settings persisted to the database and applied on every render.

**Architecture:** Extract QR generation into a shared utility, add a stateless preview API route for live-as-you-type feedback, update the edit page with a DaisyUI client form, and persist settings to `qr_codes.settings`. Logo uploads go to Supabase Storage (`qr-logos` bucket).

**Tech Stack:** Next.js 15, Supabase (Postgres + Storage), DaisyUI, Vitest, `@chillerlan/qrcode`, `sharp`, `@xmldom/xmldom`

**Spec:** `docs/superpowers/specs/2026-03-17-qr-customisation-design.md`

---

## Chunk 1: Shared QR generation utility (with logo buffer support and error handling)

---

### Task 1: Extract `generateQrCode` into a shared utility

**Files:**
- Create: `src/lib/qrcode/generate.ts`
- Modify: `src/app/qr/[uuid]/route.ts`
- Create: `src/lib/qrcode/generate.test.ts`

The current `generateQrCode` function lives inside the route file and is not reusable. Extract it so both the render route and the new preview route can call it.

- [ ] **Step 1: Write the failing tests**

Create `src/lib/qrcode/generate.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock sharp
vi.mock('sharp', () => ({
    default: vi.fn().mockReturnValue({
        jpeg: vi.fn().mockReturnValue({
            toBuffer: vi.fn().mockResolvedValue(Buffer.from('fake-jpeg')),
        }),
    }),
}));

// Capture what options are passed to QRkyOptions
let capturedOptions: Record<string, unknown> = {};
vi.mock('@/lib/qrcode', () => ({
    QRkyOptions: vi.fn().mockImplementation((opts: Record<string, unknown>) => {
        capturedOptions = opts;
        return opts;
    }),
    QRkySVG: vi.fn(),
}));

vi.mock('@chillerlan/qrcode/dist/js-qrcode-node-src.cjs', () => ({
    QRCode: vi.fn().mockImplementation(() => ({
        render: vi.fn().mockReturnValue('<svg></svg>'),
    })),
    ECC_H: 'H',
}));

// Mock fetch for remote logo URLs
global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
});

import { generateQrCode, QrSettings } from '@/lib/qrcode/generate';

describe('generateQrCode', () => {
    beforeEach(() => {
        capturedOptions = {};
        vi.clearAllMocks();
        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
            ok: true,
            arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
        });
    });

    it('returns a Uint8Array', async () => {
        const settings: QrSettings = {
            fgColor: '#000000',
            bgColor: '#ffffff',
            cornerRadius: 0.45,
            logoUrl: null,
            logoScale: 0.25,
        };
        const result = await generateQrCode('https://example.com', settings);
        expect(result).toBeInstanceOf(Uint8Array);
    });

    it('applies defaults when settings fields are missing', async () => {
        const result = await generateQrCode('https://example.com', {});
        expect(result).toBeInstanceOf(Uint8Array);
        expect(capturedOptions.bgColor).toBe('#ffffff');
        expect(capturedOptions.fgColor).toBe('#000000');
        expect(capturedOptions.circleRadius).toBe(0.45);
    });

    it('passes fgColor, bgColor, and cornerRadius to QRkyOptions', async () => {
        await generateQrCode('https://example.com', {
            fgColor: '#ff0000',
            bgColor: '#0000ff',
            cornerRadius: 0.2,
        });
        expect(capturedOptions.fgColor).toBe('#ff0000');
        expect(capturedOptions.bgColor).toBe('#0000ff');
        expect(capturedOptions.circleRadius).toBe(0.2);
    });

    it('uses default logo path when logoUrl is null', async () => {
        await generateQrCode('https://example.com', { logoUrl: null });
        // svgLogo should point to the built-in logo, not be null
        expect(capturedOptions.svgLogo).toBeTruthy();
        expect(typeof capturedOptions.svgLogo).toBe('string');
    });

    it('fetches remote logo and passes buffer when logoUrl is a URL', async () => {
        await generateQrCode('https://example.com', {
            logoUrl: 'https://example.supabase.co/storage/v1/object/public/qr-logos/user/qr.svg',
        });
        expect(global.fetch).toHaveBeenCalled();
        // svgLogoBuffer should be set, svgLogo should be null
        expect(capturedOptions.svgLogo).toBeNull();
        expect(capturedOptions.svgLogoBuffer).toBeInstanceOf(Buffer);
    });

    it('falls back to default logo if remote fetch fails', async () => {
        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: false });
        await generateQrCode('https://example.com', {
            logoUrl: 'https://example.supabase.co/storage/v1/object/public/qr-logos/user/qr.svg',
        });
        // Falls back to built-in logo
        expect(capturedOptions.svgLogo).toBeTruthy();
        expect(capturedOptions.svgLogoBuffer).toBeUndefined();
    });
});
```

- [ ] **Step 2: Run the test to confirm it fails**

```bash
pnpm test src/lib/qrcode/generate.test.ts
```

Expected: FAIL — `generateQrCode` does not exist yet.

- [ ] **Step 3: Update `src/lib/qrcode/QRkyOptions.ts` to add `svgLogoBuffer` option**

Add to the `QRkyOptionsInterface` and `QRkyOptions` class so a `Buffer` can be passed instead of a file path. Add at the bottom of the interface and class:

In `QRkyOptionsInterface`, add:
```typescript
svgLogoBuffer?: Buffer | null;
```

In `QRkyOptions` class body, add the property:
```typescript
svgLogoBuffer: Buffer | null = null;
```

And add a setter:
```typescript
protected set_svgLogoBuffer(svgLogoBuffer: Buffer | null | undefined): void {
    this.svgLogoBuffer = svgLogoBuffer ?? null;
}
```

- [ ] **Step 4: Update `src/lib/qrcode/QRkySVG.ts` to use the buffer when available**

In the `getLogo()` method, replace the `readFileSync` call to fall back to `svgLogoBuffer` when `svgLogo` is null:

```typescript
protected getLogo(): string {
    // Use buffer if provided (remote logo fetched by caller), else read from file
    let svgLogoContents: string;
    if (this.options.svgLogoBuffer) {
        svgLogoContents = this.options.svgLogoBuffer.toString('utf-8');
    } else if (this.options.svgLogo) {
        try {
            svgLogoContents = readFileSync(this.options.svgLogo, 'utf-8');
        } catch (error) {
            console.error('Error reading SVG logo file:', error);
            return '';
        }
    } else {
        return '';
    }

    try {
        const parser = new DOMParser();
        const svgDom = parser.parseFromString(svgLogoContents, 'image/svg+xml');
        const svgElement = svgDom.documentElement;
        svgElement.setAttribute('width', this.options.svgViewBoxSize.toString());
        svgElement.setAttribute('height', this.options.svgViewBoxSize.toString());

        const width = this.options.svgViewBoxSize;
        const height = this.options.svgViewBoxSize;
        const sizeMax = Math.max(width, height);
        const sizeRelative = this.moduleCount / sizeMax;
        const sizeScaled = sizeRelative * (this.options.svgLogoScale ?? 0.2);
        const eol = this.options.eol ?? '\n';
        const cssClass = this.options.svgLogoCssClass ?? 'logo';
        const logoScale = this.options.svgLogoScale ?? 0.2;
        const translateOffset = (this.moduleCount / 2) - (this.moduleCount * logoScale / 2);
        const serialized = new XMLSerializer().serializeToString(svgElement);

        return `${eol}<g transform="translate(${translateOffset} ${translateOffset}) scale(${sizeScaled})" class="${cssClass}">${eol}\t${serialized}${eol}</g>`;
    } catch (error) {
        console.error('Error processing SVG logo:', error);
        return '';
    }
}
```

Also update the `paths()` guard to check either `svgLogo` or `svgLogoBuffer`:

```typescript
protected paths(): string {
    if (this.options.clearLogoSpace) {
        const size = Math.ceil(this.moduleCount * (this.options.svgLogoScale ?? 0.2));
        this.matrix.setLogoSpace(size, size);
    }

    let svg = super.paths();

    if (this.options.svgLogo !== null || this.options.svgLogoBuffer !== null) {
        svg += this.getLogo();
    }

    return svg;
}
```

- [ ] **Step 5: Create `src/lib/qrcode/generate.ts`**

```typescript
import { ECC_H, QRCode } from '@chillerlan/qrcode/dist/js-qrcode-node-src.cjs';
import { DOMParser } from '@xmldom/xmldom';
import { QRkyOptions, QRkySVG } from '@/lib/qrcode';
import sharp from 'sharp';
import path from 'node:path';

export interface QrSettings {
    fgColor?: string;
    bgColor?: string;
    cornerRadius?: number;
    logoUrl?: string | null;
    logoScale?: number;
}

const LOGO_PATH = path.join(process.cwd(), 'public', 'qrky-logo.svg');
const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Polyfill DOMParser for Node.js environment
if (typeof globalThis.DOMParser === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).DOMParser = DOMParser;
}

async function fetchLogoBuffer(logoUrl: string): Promise<Buffer | null> {
    try {
        const response = await fetch(logoUrl);
        if (!response.ok) return null;
        return Buffer.from(await response.arrayBuffer());
    } catch {
        return null;
    }
}

export async function generateQrCode(data: string, settings: QrSettings = {}): Promise<Uint8Array> {
    const {
        fgColor = '#000000',
        bgColor = '#ffffff',
        cornerRadius = 0.45,
        logoUrl = null,
        logoScale = 0.25,
    } = settings;

    // Resolve logo: remote URL → fetch as buffer; null/default → use built-in file path
    let resolvedLogoPath: string | null = LOGO_PATH;
    let resolvedLogoBuffer: Buffer | null = null;

    if (logoUrl && logoUrl !== 'default') {
        const buffer = await fetchLogoBuffer(logoUrl);
        if (buffer) {
            resolvedLogoPath = null;
            resolvedLogoBuffer = buffer;
        }
        // If fetch failed, fall back to built-in logo (resolvedLogoPath stays as LOGO_PATH)
    }

    const options = new QRkyOptions({
        addQuietzone: true,
        quietzoneSize: 2,
        bgColor,
        fgColor,
        versionMin: 5,
        eccLevel: ECC_H,
        outputInterface: QRkySVG,
        drawLightModules: true,
        circleRadius: cornerRadius,
        svgLogo: resolvedLogoPath,
        svgLogoBuffer: resolvedLogoBuffer,
        clearLogoSpace: false,
        svgLogoScale: logoScale,
        svgLogoScaleMinimum: 0.1,
        svgLogoScaleMaximum: 0.3,
        svgLogoCssClass: 'qr-logo',
        svgViewBoxSize: 1080,
        outputBase64: false,
        returnAsDomElement: false,
    });

    const qrcode: string = (new QRCode(options)).render(data);
    const svgBuffer = Buffer.from(qrcode, 'utf-8');

    return sharp(svgBuffer)
        .jpeg({ quality: 100 })
        .toBuffer();
}

export function buildQrCodeUrl(uuid: string): string {
    return `${NEXT_PUBLIC_APP_URL}/q/${uuid}`;
}
```

- [ ] **Step 6: Export from `src/lib/qrcode/index.ts`**

Add to the bottom of `src/lib/qrcode/index.ts`:

```typescript
export { generateQrCode, buildQrCodeUrl } from './generate';
export type { QrSettings } from './generate';
```

- [ ] **Step 7: Run the tests to confirm they pass**

```bash
pnpm test src/lib/qrcode/generate.test.ts
```

Expected: PASS

- [ ] **Step 8: Update `src/app/qr/[uuid]/route.ts` to use the shared utility**

The existing route uses a count-only query with a PostgREST join filter (`.eq('url_objects.enabled', true)`). Preserve this pattern and add `settings` to the select:

```typescript
import { generateQrCode, buildQrCodeUrl } from '@/lib/qrcode/generate';
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect, RedirectType } from 'next/navigation';
import { NextRequest } from 'next/server';
import { QrSettings } from '@/lib/qrcode/generate';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ uuid: string }> }
) {
    const { uuid } = await params;
    const supabase = await createClient();

    const { data: qrCode, error } = await supabase
        .from('qr_codes')
        .select('id, settings, url_objects!inner(enabled)')
        .eq('id', uuid)
        .eq('url_objects.enabled', true)
        .maybeSingle();

    if (error) {
        console.error(error);
        return redirect('/500', RedirectType.push);
    }

    if (!qrCode) {
        notFound();
    }

    const url = buildQrCodeUrl(uuid);

    try {
        const jpeg = await generateQrCode(url, (qrCode.settings ?? {}) as QrSettings);
        return new Response(jpeg as BodyInit, {
            headers: {
                'Content-Type': 'image/jpeg',
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (e) {
        console.error(e);
        return redirect('/500', RedirectType.push);
    }
}
```

- [ ] **Step 9: Run all tests and build**

```bash
pnpm test && pnpm build
```

Expected: All tests pass, build succeeds.

- [ ] **Step 10: Commit**

```bash
git add src/lib/qrcode/generate.ts src/lib/qrcode/generate.test.ts src/lib/qrcode/index.ts src/lib/qrcode/QRkyOptions.ts src/lib/qrcode/QRkySVG.ts src/app/qr/\[uuid\]/route.ts
git commit -m "refactor(qr): extract generateQrCode into shared utility with logo buffer support"
```

---

## Chunk 2: Supabase Storage bucket + preview API route

---

### Task 2: Create the `qr-logos` storage bucket migration

**Files:**
- Create: `supabase/migrations/20260317210000_create_qr_logos_bucket.sql`

> The timestamp `20260317210000` is chosen to be later than the existing `20260317200000` migration. Do not change it.

- [ ] **Step 1: Create the migration file**

```sql
-- Create qr-logos storage bucket for custom QR code logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'qr-logos',
    'qr-logos',
    true,
    524288, -- 500 KB
    ARRAY['image/svg+xml', 'image/png', 'image/jpeg']
)
ON CONFLICT (id) DO NOTHING;

-- RLS: authenticated users can upload to their own folder
CREATE POLICY "Users can upload own QR logos"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'qr-logos'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- RLS: authenticated users can update/replace their own logos
CREATE POLICY "Users can update own QR logos"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'qr-logos'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- RLS: authenticated users can delete their own logos
CREATE POLICY "Users can delete own QR logos"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'qr-logos'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Public read (bucket is public, but explicit policy for clarity)
CREATE POLICY "Public read for QR logos"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'qr-logos');
```

- [ ] **Step 2: Apply the migration**

For local dev:
```bash
npx supabase db reset
```

For remote (staging/production):
```bash
npx supabase db push
```

Expected: Migration applied without errors.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/
git commit -m "chore(db): add qr-logos storage bucket with RLS policies"
```

---

### Task 3: Create the stateless preview API route

**Files:**
- Create: `src/app/api/qr/preview/route.ts`

No test file needed — `route.ts` files are excluded from coverage. The underlying `generateQrCode` is already tested.

- [ ] **Step 1: Create `src/app/api/qr/preview/route.ts`**

```typescript
import { generateQrCode } from '@/lib/qrcode/generate';
import { NextRequest } from 'next/server';

const SUPABASE_STORAGE_PREFIX = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/qr-logos/`;

function isLogoUrlAllowed(logoUrl: string): boolean {
    return logoUrl === 'default' || logoUrl.startsWith(SUPABASE_STORAGE_PREFIX);
}

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;

    const data = searchParams.get('data');
    if (!data) {
        return new Response('Missing required param: data', { status: 400 });
    }

    const fgColor = searchParams.get('fgColor') ?? '#000000';
    const bgColor = searchParams.get('bgColor') ?? '#ffffff';
    const cornerRadius = parseFloat(searchParams.get('cornerRadius') ?? '0.45');
    const logoScale = parseFloat(searchParams.get('logoScale') ?? '0.25');
    const rawLogoUrl = searchParams.get('logoUrl') ?? 'default';

    if (!isLogoUrlAllowed(rawLogoUrl)) {
        return new Response('Invalid logoUrl', { status: 400 });
    }

    const logoUrl = rawLogoUrl === 'default' ? null : rawLogoUrl;

    try {
        const jpeg = await generateQrCode(data, {
            fgColor,
            bgColor,
            cornerRadius: Math.max(0, Math.min(0.5, cornerRadius)),
            logoUrl,
            logoScale: Math.max(0.1, Math.min(0.3, logoScale)),
        });

        return new Response(jpeg as BodyInit, {
            headers: {
                'Content-Type': 'image/jpeg',
                'Cache-Control': 'no-store',
            },
        });
    } catch (e) {
        console.error(e);
        return new Response('Failed to generate QR code', { status: 500 });
    }
}
```

- [ ] **Step 2: Run build to verify no type errors**

```bash
pnpm build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/qr/preview/route.ts
git commit -m "feat(qr): add stateless preview API route"
```

---

## Chunk 3: Server action — save settings + upload logo

---

### Task 4: Implement `updateQrCode` server action

**Files:**
- Modify: `src/app/dashboard/urls/[uuid]/qr/edit/actions.ts`
- Create: `src/app/dashboard/urls/[uuid]/qr/edit/actions.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/app/dashboard/urls/[uuid]/qr/edit/actions.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockRedirect = vi.fn();
const mockRevalidatePath = vi.fn();
vi.mock('next/navigation', () => ({
    redirect: mockRedirect,
    RedirectType: { push: 'push' },
}));
vi.mock('next/cache', () => ({ revalidatePath: mockRevalidatePath }));

let mockUpdate = vi.fn();
let mockSelect = vi.fn();
let mockEq = vi.fn();
let mockSingle = vi.fn();
let mockUpload = vi.fn();
let mockGetPublicUrl = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(() => ({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
        from: vi.fn((table: string) => ({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            update: mockUpdate,
            single: mockSingle,
        })),
        storage: {
            from: vi.fn(() => ({
                upload: mockUpload,
                getPublicUrl: mockGetPublicUrl,
            })),
        },
    })),
}));

import { updateQrCode } from './actions';

describe('updateQrCode', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSingle.mockResolvedValue({ data: { id: 'qr-1' }, error: null });
        mockUpdate.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
        mockRedirect.mockImplementation(() => { throw new Error('NEXT_REDIRECT'); });
    });

    it('returns error when qr_code_id is missing', async () => {
        const formData = new FormData();
        formData.append('url_uuid', 'url-1');
        const result = await updateQrCode({ message: '', success: false }, formData);
        expect(result).toEqual({ message: 'Invalid input', success: false });
    });

    it('returns error when QR code does not belong to user', async () => {
        mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'not found' } });
        const formData = new FormData();
        formData.append('qr_code_id', 'qr-other');
        formData.append('url_uuid', 'url-1');
        formData.append('fgColor', '#000000');
        formData.append('bgColor', '#ffffff');
        formData.append('cornerRadius', '0.45');
        formData.append('logoScale', '0.25');
        const result = await updateQrCode({ message: '', success: false }, formData);
        expect(result).toEqual({ message: 'QR code not found', success: false });
    });

    it('returns error when fgColor is invalid hex', async () => {
        const formData = new FormData();
        formData.append('qr_code_id', 'qr-1');
        formData.append('url_uuid', 'url-1');
        formData.append('fgColor', 'not-a-color');
        formData.append('bgColor', '#ffffff');
        formData.append('cornerRadius', '0.45');
        formData.append('logoScale', '0.25');
        const result = await updateQrCode({ message: '', success: false }, formData);
        expect(result.success).toBe(false);
        expect(result.message).toMatch(/colour/i);
    });

    it('returns error when bgColor is invalid hex', async () => {
        const formData = new FormData();
        formData.append('qr_code_id', 'qr-1');
        formData.append('url_uuid', 'url-1');
        formData.append('fgColor', '#000000');
        formData.append('bgColor', 'bad');
        formData.append('cornerRadius', '0.45');
        formData.append('logoScale', '0.25');
        const result = await updateQrCode({ message: '', success: false }, formData);
        expect(result.success).toBe(false);
    });

    it('saves settings and redirects on valid input (no logo)', async () => {
        const formData = new FormData();
        formData.append('qr_code_id', 'qr-1');
        formData.append('url_uuid', 'url-1');
        formData.append('fgColor', '#000000');
        formData.append('bgColor', '#ffffff');
        formData.append('cornerRadius', '0.45');
        formData.append('logoScale', '0.25');
        await expect(
            updateQrCode({ message: '', success: false }, formData)
        ).rejects.toThrow('NEXT_REDIRECT');
        expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard/urls');
    });

    it('clamps cornerRadius to valid range', async () => {
        let capturedSettings: unknown;
        mockUpdate.mockImplementation((data: unknown) => {
            capturedSettings = data;
            return { eq: vi.fn().mockResolvedValue({ error: null }) };
        });
        const formData = new FormData();
        formData.append('qr_code_id', 'qr-1');
        formData.append('url_uuid', 'url-1');
        formData.append('fgColor', '#000000');
        formData.append('bgColor', '#ffffff');
        formData.append('cornerRadius', '99');
        formData.append('logoScale', '0.25');
        await expect(
            updateQrCode({ message: '', success: false }, formData)
        ).rejects.toThrow('NEXT_REDIRECT');
        expect((capturedSettings as { settings: { cornerRadius: number } }).settings.cornerRadius).toBe(0.5);
    });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
pnpm test "src/app/dashboard/urls/\[uuid\]/qr/edit/actions.test.ts"
```

Expected: FAIL — `updateQrCode` is a stub that doesn't implement this logic.

- [ ] **Step 3: Implement `updateQrCode` in `src/app/dashboard/urls/[uuid]/qr/edit/actions.ts`**

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect, RedirectType } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ActionResponseInterface } from "@/interfaces/action-response";

const HEX_REGEX = /^#[0-9a-fA-F]{6}$/;

function isValidHex(value: string): boolean {
    return HEX_REGEX.test(value);
}

export async function updateQrCode(
    _state: ActionResponseInterface,
    formData: FormData
): Promise<ActionResponseInterface> {
    const qrCodeId = formData.get("qr_code_id") as string | null;
    const urlUuid = formData.get("url_uuid") as string | null;
    const fgColor = (formData.get("fgColor") as string | null) ?? "#000000";
    const bgColor = (formData.get("bgColor") as string | null) ?? "#ffffff";
    const cornerRadius = Math.max(0, Math.min(0.5, parseFloat((formData.get("cornerRadius") as string | null) ?? "0.45")));
    const logoScale = Math.max(0.1, Math.min(0.3, parseFloat((formData.get("logoScale") as string | null) ?? "0.25")));
    const logoFile = formData.get("logo") as File | null;

    if (!qrCodeId || !urlUuid) {
        return { message: "Invalid input", success: false };
    }

    if (!isValidHex(fgColor)) {
        return { message: "Invalid foreground colour — must be a hex value like #000000", success: false };
    }

    if (!isValidHex(bgColor)) {
        return { message: "Invalid background colour — must be a hex value like #ffffff", success: false };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { message: "Unauthorised", success: false };
    }

    // Verify the QR code exists and belongs to this user via url_objects ownership
    const { data: qrCode, error: fetchError } = await supabase
        .from("qr_codes")
        .select("id, url_objects!inner(user_id)")
        .eq("id", qrCodeId)
        .eq("url_objects.user_id", user.id)
        .single();

    if (fetchError || !qrCode) {
        return { message: "QR code not found", success: false };
    }

    let logoUrl: string | null = null;

    // Upload new logo if provided
    if (logoFile && logoFile.size > 0) {
        if (logoFile.size > 524288) {
            return { message: "Logo file must be under 500 KB", success: false };
        }

        const allowedTypes = ["image/svg+xml", "image/png", "image/jpeg"];
        if (!allowedTypes.includes(logoFile.type)) {
            return { message: "Logo must be SVG, PNG, or JPG", success: false };
        }

        const ext = logoFile.type === "image/svg+xml" ? "svg" : logoFile.type === "image/png" ? "png" : "jpg";
        const filePath = `${user.id}/${qrCodeId}.${ext}`;
        const fileBuffer = Buffer.from(await logoFile.arrayBuffer());

        const { error: uploadError } = await supabase.storage
            .from("qr-logos")
            .upload(filePath, fileBuffer, {
                contentType: logoFile.type,
                upsert: true,
            });

        if (uploadError) {
            console.error(uploadError.message);
            return { message: "Failed to upload logo", success: false };
        }

        const { data: publicUrlData } = supabase.storage
            .from("qr-logos")
            .getPublicUrl(filePath);

        logoUrl = publicUrlData.publicUrl;
    }

    const settings = {
        fgColor,
        bgColor,
        cornerRadius,
        logoScale,
        ...(logoUrl !== null ? { logoUrl } : {}),
    };

    const { error: updateError } = await supabase
        .from("qr_codes")
        .update({ settings })
        .eq("id", qrCodeId);

    if (updateError) {
        console.error(updateError.message);
        return { message: "Failed to save settings", success: false };
    }

    revalidatePath("/dashboard/urls");
    redirect("/dashboard/urls", RedirectType.push);
}
```

- [ ] **Step 4: Run the tests to confirm they pass**

```bash
pnpm test "src/app/dashboard/urls/\[uuid\]/qr/edit/actions.test.ts"
```

Expected: PASS

- [ ] **Step 5: Run all tests**

```bash
pnpm test
```

Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/app/dashboard/urls/\[uuid\]/qr/edit/actions.ts src/app/dashboard/urls/\[uuid\]/qr/edit/actions.test.ts
git commit -m "feat(qr): implement updateQrCode action with settings persistence and logo upload"
```

---

## Chunk 4: Edit page UI — DaisyUI form with live preview

---

### Task 5: Build the `QrEditForm` client component

**Files:**
- Create: `src/app/dashboard/urls/[uuid]/qr/edit/components/form/qr-edit-form.tsx`
- Create: `src/app/dashboard/urls/[uuid]/qr/edit/components/form/qr-edit-form.test.tsx`
- Modify: `src/app/dashboard/urls/[uuid]/qr/edit/page.tsx`

- [ ] **Step 1: Write the failing component test**

Create `src/app/dashboard/urls/[uuid]/qr/edit/components/form/qr-edit-form.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QrEditForm } from './qr-edit-form';

vi.mock('next/image', () => ({
    default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}));

vi.mock('@/app/dashboard/urls/[uuid]/qr/edit/actions', () => ({
    updateQrCode: vi.fn(),
}));

const defaultProps = {
    qrCodeId: 'qr-1',
    urlUuid: 'url-1',
    urlString: 'https://example.com',
    settings: {
        fgColor: '#000000',
        bgColor: '#ffffff',
        cornerRadius: 0.45,
        logoUrl: null,
        logoScale: 0.25,
    },
};

describe('QrEditForm', () => {
    it('renders colour inputs with current settings', () => {
        render(<QrEditForm {...defaultProps} />);
        expect(screen.getByDisplayValue('#000000')).toBeInTheDocument();
        expect(screen.getByDisplayValue('#ffffff')).toBeInTheDocument();
    });

    it('renders the Save Changes button', () => {
        render(<QrEditForm {...defaultProps} />);
        expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
    });

    it('renders the Cancel button', () => {
        render(<QrEditForm {...defaultProps} />);
        expect(screen.getByRole('link', { name: /cancel/i })).toBeInTheDocument();
    });

    it('renders the live preview image', () => {
        render(<QrEditForm {...defaultProps} />);
        const preview = screen.getByAltText('QR Code Preview');
        expect(preview).toBeInTheDocument();
        expect(preview.getAttribute('src')).toContain('/api/qr/preview');
    });

    it('shows the QRky default logo label when logoUrl is null', () => {
        render(<QrEditForm {...defaultProps} />);
        expect(screen.getByText(/qrky logo/i)).toBeInTheDocument();
    });

    it('updates the preview image src when foreground colour changes', async () => {
        const { userEvent } = await import('@testing-library/user-event');
        const user = userEvent.setup();
        render(<QrEditForm {...defaultProps} />);
        const colorInput = screen.getByDisplayValue('#000000');
        await user.type(colorInput, '#ff0000');
        const preview = screen.getByAltText('QR Code Preview');
        expect(preview.getAttribute('src')).toContain('fgColor');
    });
});
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
pnpm test "qr-edit-form.test.tsx"
```

Expected: FAIL — component does not exist yet.

- [ ] **Step 3: Create `src/app/dashboard/urls/[uuid]/qr/edit/components/form/qr-edit-form.tsx`**

```typescript
"use client";

import React, { useState, useCallback, useTransition } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { updateQrCode } from "@/app/dashboard/urls/[uuid]/qr/edit/actions";
import { ActionResponseInterface } from "@/interfaces/action-response";
import ErrorMessageComponent from "@/components/ui/alert/error-message";
import { QrSettings } from "@/lib/qrcode/generate";

interface QrEditFormProps {
    qrCodeId: string;
    urlUuid: string;
    urlString: string;
    settings: QrSettings;
}

function buildPreviewUrl(data: string, settings: QrSettings): string {
    const params = new URLSearchParams({
        data,
        fgColor: settings.fgColor ?? "#000000",
        bgColor: settings.bgColor ?? "#ffffff",
        cornerRadius: String(settings.cornerRadius ?? 0.45),
        logoUrl: settings.logoUrl ?? "default",
        logoScale: String(settings.logoScale ?? 0.25),
    });
    return `/api/qr/preview?${params.toString()}`;
}

export function QrEditForm({ qrCodeId, urlUuid, urlString, settings }: QrEditFormProps): React.ReactNode {
    const [fgColor, setFgColor] = useState(settings.fgColor ?? "#000000");
    const [bgColor, setBgColor] = useState(settings.bgColor ?? "#ffffff");
    const [cornerRadius, setCornerRadius] = useState(settings.cornerRadius ?? 0.45);
    const [logoScale, setLogoScale] = useState(settings.logoScale ?? 0.25);
    const [logoUrl] = useState<string | null>(settings.logoUrl ?? null);
    const [previewKey, setPreviewKey] = useState(0);
    const [, startTransition] = useTransition();

    const [state, formAction, pending] = useActionState<ActionResponseInterface, FormData>(
        updateQrCode,
        { message: "", success: false }
    );

    const refreshPreview = useCallback(() => {
        startTransition(() => setPreviewKey(k => k + 1));
    }, []);

    const currentSettings: QrSettings = { fgColor, bgColor, cornerRadius, logoUrl, logoScale };
    const previewUrl = buildPreviewUrl(urlString, currentSettings);

    return (
        <div className="prose mx-auto mt-12 max-w-none px-4">
            <h1 className="text-xl font-bold mb-1">Edit QR Code</h1>
            <p className="text-sm opacity-50 mb-6">{urlString}</p>

            <div className="flex gap-8 items-start">
                {/* Settings panel */}
                <div className="flex-1 flex flex-col gap-5">
                    <form action={formAction}>
                        <input type="hidden" name="qr_code_id" value={qrCodeId} />
                        <input type="hidden" name="url_uuid" value={urlUuid} />
                        <input type="hidden" name="cornerRadius" value={cornerRadius} />
                        <input type="hidden" name="logoScale" value={logoScale} />

                        {/* Colours */}
                        <div className="mb-4">
                            <p className="label-text font-semibold text-xs uppercase tracking-widest opacity-50 mb-2">Colours</p>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="label py-0 mb-1"><span className="label-text text-xs">Foreground</span></label>
                                    <div className="input input-bordered input-sm flex items-center gap-2">
                                        <input
                                            type="color"
                                            name="fgColor"
                                            value={fgColor}
                                            onChange={e => { setFgColor(e.target.value); refreshPreview(); }}
                                            className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent"
                                        />
                                        <span className="font-mono text-xs">{fgColor}</span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <label className="label py-0 mb-1"><span className="label-text text-xs">Background</span></label>
                                    <div className="input input-bordered input-sm flex items-center gap-2">
                                        <input
                                            type="color"
                                            name="bgColor"
                                            value={bgColor}
                                            onChange={e => { setBgColor(e.target.value); refreshPreview(); }}
                                            className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent"
                                        />
                                        <span className="font-mono text-xs">{bgColor}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Corner radius */}
                        <div className="mb-4">
                            <p className="label-text font-semibold text-xs uppercase tracking-widest opacity-50 mb-2">Module Shape</p>
                            <label className="label py-0 mb-1">
                                <span className="label-text text-xs">Corner radius</span>
                                <span className="label-text-alt font-mono text-xs">{cornerRadius.toFixed(2)}</span>
                            </label>
                            <div className="flex items-center gap-2">
                                <span className="text-xs opacity-40">Square</span>
                                <input
                                    type="range"
                                    min="0"
                                    max="50"
                                    value={Math.round(cornerRadius * 100)}
                                    onChange={e => { setCornerRadius(parseInt(e.target.value) / 100); refreshPreview(); }}
                                    className="range range-primary range-xs flex-1"
                                />
                                <span className="text-xs opacity-40">Round</span>
                            </div>
                        </div>

                        {/* Logo */}
                        <div className="mb-6">
                            <p className="label-text font-semibold text-xs uppercase tracking-widest opacity-50 mb-2">Logo</p>
                            <div className="bg-base-200 rounded-xl p-3 flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-base-300 text-xs font-bold text-primary">
                                        Q
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold">
                                            {logoUrl ? "Custom logo" : "QRky logo (default)"}
                                        </p>
                                        <p className="text-xs opacity-40">Upload a custom logo to replace</p>
                                    </div>
                                </div>
                                <div className="border-t border-base-300 pt-3">
                                    <input
                                        type="file"
                                        name="logo"
                                        accept=".svg,.png,.jpg,.jpeg,image/svg+xml,image/png,image/jpeg"
                                        className="file-input file-input-bordered file-input-xs w-full"
                                        onChange={refreshPreview}
                                    />
                                    <p className="text-xs opacity-40 mt-1">SVG, PNG, JPG · max 500 KB. Reverts to QRky logo if cleared.</p>
                                </div>
                                <div className="border-t border-base-300 pt-3">
                                    <label className="label py-0 mb-1">
                                        <span className="label-text text-xs">Logo size</span>
                                        <span className="label-text-alt font-mono text-xs">{Math.round(logoScale * 100)}%</span>
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs opacity-40">10%</span>
                                        <input
                                            type="range"
                                            min="10"
                                            max="30"
                                            value={Math.round(logoScale * 100)}
                                            onChange={e => { setLogoScale(parseInt(e.target.value) / 100); refreshPreview(); }}
                                            className="range range-primary range-xs flex-1"
                                        />
                                        <span className="text-xs opacity-40">30%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {state?.message && !state.success && (
                            <div className="mb-4">
                                <ErrorMessageComponent message={state.message} />
                            </div>
                        )}

                        <div className="flex gap-2">
                            <button type="submit" className="btn btn-primary btn-sm flex-1" disabled={pending}>
                                {pending ? "Saving..." : "Save Changes"}
                            </button>
                            <Link href="/dashboard/urls" className="btn btn-outline btn-sm flex-1">Cancel</Link>
                        </div>
                    </form>
                </div>

                {/* Live preview panel */}
                <div className="flex-none w-52 flex flex-col items-center gap-3">
                    <p className="label-text font-semibold text-xs uppercase tracking-widest opacity-50">Live Preview</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        key={previewKey}
                        src={previewUrl}
                        alt="QR Code Preview"
                        width={200}
                        height={200}
                        className="rounded-xl border border-base-300 bg-white p-2 shadow-inner"
                    />
                    <p className="text-xs opacity-30 text-center">Updates after each change</p>
                    <a href={`/qr/${qrCodeId}`} download={`qrky-${qrCodeId}.jpg`} className="btn btn-outline btn-xs w-full">
                        Download
                    </a>
                </div>
            </div>
        </div>
    );
}
```

- [ ] **Step 4: Run component tests to confirm they pass**

```bash
pnpm test "qr-edit-form.test.tsx"
```

Expected: PASS

- [ ] **Step 5: Update `src/app/dashboard/urls/[uuid]/qr/edit/page.tsx` to use the new form**

Replace the file content with:

```typescript
import React from "react";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { QrEditForm } from "./components/form/qr-edit-form";

export default async function EditQrCodePage({
    params,
}: {
    params: Promise<{ uuid: string }>;
}): Promise<React.ReactNode> {
    const { uuid } = await params;
    const supabase = await createClient();

    const { data: url, error: urlError } = await supabase
        .from("url_objects")
        .select("id, url")
        .eq("uuid", uuid)
        .maybeSingle();

    if (urlError || !url) {
        notFound();
    }

    const { data: qrCodes } = await supabase
        .from("qr_codes")
        .select("id, settings")
        .eq("url_object_id", url.id);

    if (!qrCodes || qrCodes.length === 0) {
        return (
            <div className="prose mx-auto text-center mt-20">
                <h1>No QR Code Yet</h1>
                <p className="text-sm opacity-70">{url.url}</p>
                <div className="alert alert-info max-w-md mx-auto mt-8">
                    <span>This URL does not have a QR code yet.</span>
                </div>
                <div className="mt-8 flex flex-col gap-4 max-w-md mx-auto">
                    <Link href={`/dashboard/urls/${uuid}/qr/new`} className="btn btn-primary">Create QR Code</Link>
                    <Link href="/dashboard/urls" className="btn btn-outline">Back to URLs</Link>
                </div>
            </div>
        );
    }

    const qrCode = qrCodes[0];

    return (
        <QrEditForm
            qrCodeId={qrCode.id}
            urlUuid={uuid}
            urlString={url.url}
            settings={qrCode.settings ?? {}}
        />
    );
}
```

- [ ] **Step 6: Run lint, all tests, and build**

```bash
pnpm lint && pnpm test && pnpm build
```

Expected: No lint errors, all tests pass, build succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/app/dashboard/urls/\[uuid\]/qr/edit/
git commit -m "feat(qr): add QrEditForm with live preview and DaisyUI components"
```

---

## Chunk 5: Final quality pass

---

### Task 6: Run full quality gates and clean up

- [ ] **Step 1: Run all tests**

```bash
pnpm test
```

Expected: All tests pass.

- [ ] **Step 2: Run lint**

```bash
pnpm lint
```

Expected: No errors. Fix any lint issues before continuing.

- [ ] **Step 3: Run build**

```bash
pnpm build
```

Expected: Build succeeds with no type errors or prerender failures.

- [ ] **Step 4: Close the task in beads**

```bash
BD_ACTOR="Engineer" bd update qrky-7qp --status open
BD_ACTOR="Engineer" bd update qrky-7qp --claim
BD_ACTOR="Engineer" bd close qrky-7qp --reason "QR customisation implemented: shared generate utility, preview API route, updateQrCode action with logo upload to Supabase Storage, QrEditForm with live preview. All tests pass."
```

- [ ] **Step 5: Commit any lint fixes, then push**

```bash
git pull --rebase
git push
```

Expected: `git status` shows "Your branch is up to date with 'origin/...'"
