# Production Deployment Guide

## Environment Variables

### Required Variables

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL | `https://<project>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase anonymous key (client-side) | `eyJhbG...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | Supabase service role key (server-only) | `eyJhbG...` |
| `NEXT_PUBLIC_APP_URL` | Public | Application public URL | `https://qrky.app` |

**Security Notes:**
- `SUPABASE_SERVICE_ROLE_KEY` must NEVER be exposed to client-side
- `NEXT_PUBLIC_*` variables are embedded in client bundle
- Use different keys for production vs staging

## Supabase Production Setup

### 1. Database
- [ ] Create production project in Supabase
- [ ] Run all migrations
- [ ] Verify RLS policies are enabled on all tables
- [ ] Create database indices for performance:
  - `url_objects.uuid` (unique)
  - `url_objects.identifier` (unique)
  - `aliases.value` (unique, lowercase)
  - `qr_codes.id` (primary key)
  - `visits.url_object_id`, `visits.qr_code_id`, `visits.alias_id` (foreign keys)

### 2. Auth Configuration
- [ ] Configure auth providers (Email, OAuth if needed)
- [ ] Set up email templates
- [ ] Configure redirect URLs in Supabase Auth settings
- [ ] Enable email confirmation if required

### 3. Storage (if using logo uploads)
- [ ] Create storage bucket for logos
- [ ] Configure bucket policies

## Build Verification

```bash
# Install dependencies
pnpm install

# Run quality gates
pnpm lint
pnpm test
pnpm build
```

**Build Output Check:**
- No TypeScript errors
- No ESLint errors (warnings acceptable)
- Static pages generated successfully
- Dynamic routes marked with ƒ (function)
- Middleware shows as ƒ Proxy

## Domain & SSL

### Option 1: Vercel (Recommended)
1. Connect GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Configure custom domain
4. SSL automatically provided

### Option 2: Self-Hosted
1. Configure DNS A/AAAA records
2. Set up reverse proxy (nginx/Caddy)
3. Obtain SSL certificate (Let's Encrypt)
4. Configure server to serve `.next/static`
5. Run `next start` on server

## Pre-Deploy Checklist

- [ ] All tests passing (157)
- [ ] Coverage baseline established (96.59%)
- [ ] Build succeeds locally
- [ ] Environment variables configured in hosting platform
- [ ] Supabase production project ready
- [ ] Domain DNS configured
- [ ] SSL certificate active

## Post-Deploy Verification

1. **Health Checks:**
   ```bash
   curl https://<domain>/
   curl https://<domain>/login
   ```

2. **Test User Flows:**
   - Register account
   - Create short URL
   - Generate QR code
   - Access /u/[alias] redirect
   - Access /q/[id] redirect
   - View analytics

3. **Verify Analytics:**
   - Check visits are being recorded
   - Confirm analytics page displays data

## Rollback Plan

1. Keep previous deployment image/build
2. Document database migration rollback steps
3. Have Supabase project backup
4. Monitor error rates for 1 hour post-deploy

## Monitoring

- Set up error tracking (Sentry recommended)
- Configure uptime monitoring
- Monitor Supabase dashboard for:
  - Database performance
  - Auth rate limits
  - Storage usage
