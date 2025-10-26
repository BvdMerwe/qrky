# Repository Overview

## Project Description

**QRky** is a Next.js-based QR code generation and URL shortening service with custom styled QR codes and tracking capabilities.

### Main Purpose
- Generate customizable QR codes with rounded corners and embedded logos
- Provide URL shortening with multiple identifier patterns (`/q/`, `/u/`, `/qr/`)
- Track views and analytics through Supabase integration
- Serve SVG QR codes dynamically via API routes

### Key Technologies
- **Framework**: Next.js 16.0 (App Router with TypeScript)
- **UI**: React 19.2, Tailwind CSS 4
- **QR Generation**: Custom TypeScript port of `@chillerlan/qrcode` with SVG enhancements
- **Database**: Supabase (PostgreSQL with real-time capabilities)
- **Runtime**: Node.js with XMLDom for server-side SVG manipulation

## Architecture Overview

### High-Level Architecture
```
Client Request → Next.js App Router → Route Handler/Page Component
                                    ↓
                              Supabase Client
                                    ↓
                        Database (qr_codes, url_objects, views)
                                    ↓
                            Analytics/Redirect
```

### Main Components

1. **QR Code Generation Library** (`src/lib/qrcode/`)
   - `QRkySVG`: Custom SVG renderer with rounded module shapes
   - `QRkyOptions`: Configuration class with validation
   - `ModuleTypeEnum`: Connection pattern detection for smart corner rounding

2. **URL Shortening Routes**
   - `/q/[identifier]`: QR code identifier redirects
   - `/u/[identifier]`: URL object identifier redirects
   - `/qr/[uuid]/route.ts`: Dynamic QR code SVG generation

3. **Database Layer**
   - `server.ts`: Supabase server-side client with cookie management
   - `browser.ts`: Client-side Supabase instance
   - `record-view.ts`: Analytics tracking with IP and user-agent

4. **Redirect Logic**
   - `redirectUser.ts`: Centralized redirect handler with error management
   - Tracks views before redirecting
   - Handles 404/500 error cases

### Data Flow
1. User visits shortened URL (`/q/[id]` or `/u/[id]`)
2. Next.js page component queries Supabase for URL mapping
3. View is recorded with metadata (IP, user-agent, timestamp)
4. User is redirected to destination URL or error page
5. QR codes are generated on-demand via `/qr/[uuid]` route

## Directory Structure

```
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── [slug]/              # Dynamic slug routing
│   │   ├── q/[identifier]/      # QR code redirects
│   │   ├── u/[identifier]/      # URL object redirects
│   │   ├── qr/[uuid]/route.ts   # QR code SVG API endpoint
│   │   ├── 404/page.tsx         # Not found page
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Home page
│   │
│   ├── lib/                     # Shared utilities
│   │   ├── qrcode/              # Custom QR code library
│   │   │   ├── QRkySVG.ts      # SVG renderer with rounded corners
│   │   │   ├── QRkyOptions.ts  # Options class with validation
│   │   │   ├── module-type.enum.ts # Module connection patterns
│   │   │   ├── index.ts        # Public exports
│   │   │   └── README.md       # Library documentation
│   │   │
│   │   ├── server.ts    # Supabase server client
│   │   ├── browser.ts   # Supabase browser client
│   │   ├── redirectUser.ts     # Redirect logic
│   │   └── record-view.ts      # Analytics tracking
│   │
│   └── functions/               # Serverless functions
│       └── generate.ts
│
├── types/                       # TypeScript declarations
│   └── chillerlan-qrcode.d.ts  # QR library type definitions
│
├── public/                      # Static assets
├── NovaQRCodeOptions.php        # PHP reference implementation
└── Configuration files
```

### Key Files
- **Entry Point**: `src/app/layout.tsx` (root layout)
- **QR API**: `src/app/qr/[uuid]/route.ts` (SVG generation endpoint)
- **Database Config**: Environment variables for Supabase
- **Type Definitions**: `types/chillerlan-qrcode.d.ts`

## Development Workflow

### Setup
```bash
# Install dependencies (using pnpm)
pnpm install

# Set up environment variables
# Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ADMIN_KEY

# Run development server
pnpm dev
```

### Build & Deploy
```bash
# Production build
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

### Testing Approach
- **No explicit test framework** currently configured
- Manual testing via development server
- QR code validation through visual inspection

### Development Environment
- **Node.js**: v20+ recommended
- **Package Manager**: pnpm (lockfile present)
- **Editor**: TypeScript-aware (VSCode recommended)
- **Database**: Supabase project with proper schema

### Lint and Format
```bash
# Run ESLint (Next.js config with TypeScript)
pnpm lint

# ESLint configuration: eslint.config.mjs
# Includes: next/core-web-vitals, TypeScript support
```

## Key Implementation Details

### QR Code Customization
The custom QR library (`QRkySVG`) provides:
- **Smart Corner Rounding**: Detects neighbor modules using binary flags
- **Logo Embedding**: SVG logos centered with configurable scale
- **Module Types**: 16 connection patterns for optimal aesthetics
- **TypeScript Port**: Direct port of PHP `NovaQRCodeSVG` implementation

### Database Schema (Inferred)
```sql
qr_codes:
  - id (identifier)
  - url_objects (relation)

url_objects:
  - id
  - identifier
  - url
  - enabled

views (via RPC):
  - recorded via record_view() function
  - tracks: objecttype, identifier, ip, useragent
```

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL       # Supabase project URL
NEXT_PUBLIC_SUPABASE_ADMIN_KEY # Service role key (server-side only)
```

## Common Patterns

### Adding New Routes
1. Create page in `src/app/[route]/page.tsx`
2. Use `createClient()` for database access
3. Implement redirect logic via `redirectUser()`
4. Track views with `recordView()`

### Customizing QR Codes
```typescript
import { QRCode, ECC_H } from '@chillerlan/qrcode/dist/js-qrcode-node-src.cjs';
import { QRkySVG, QRkyOptions } from '@/lib/qrcode';

const options = new QRkyOptions({
  outputInterface: QRkySVG,
  circleRadius: 0.45,        // Roundness (0-0.5)
  svgLogo: '/path/to/logo',  // Optional logo
  svgLogoScale: 0.35,        // Logo size (10-30%)
  clearLogoSpace: true,      // Clear space for logo
  svgViewBoxSize: 1920,      // SVG dimensions
});
```

### Extending the Library
- Add new module types in `module-type.enum.ts`
- Implement shape logic in `QRkySVG.determineModuleShape()`
- Update options in `QRkyOptions` with validation
- Document changes in `src/lib/qrcode/README.md`
