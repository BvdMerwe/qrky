# OAuth Integration Design

## Overview
Implement Google and GitHub OAuth authentication with Supabase, allowing users to sign in via third-party providers.

## Scope
- Enable OAuth on login and registration pages
- Create OAuth callback handler
- Support account linking for existing users
- OAuth users bypass email verification (email verified by provider)

## Architecture

### Components
1. **OAuth Buttons** - Client component for triggering OAuth flow
2. **Auth Callback Route** - `/auth/callback` handles code exchange
3. **Middleware Update** - Exclude callback from auth checks

### Data Flow
1. User clicks "Log in with Google/GitHub"
2. Redirect to Supabase OAuth URL
3. User authorizes on provider
4. Redirect to `/auth/callback` with auth code
5. Exchange code for session
6. Redirect to dashboard

## Implementation Details

### 1. Create OAuth Buttons Component
- Location: `src/components/auth/oauth-buttons.tsx`
- Use `signInWithOAuth` from Supabase
- Support `google` and `github` providers
- Redirect to `/auth/callback`

### 2. Create Callback Route
- Location: `src/app/auth/callback/route.ts`
- Exchange code for session using `exchangeCodeForSession`
- Handle errors gracefully
- Redirect to `/dashboard` on success

### 3. Update Login/Register Pages
- Replace static `<a>` buttons with OAuthButtons component

### 4. Update Middleware
- Add `/auth/callback` to public routes

### 5. Account Linking (Future)
- Allow existing users to link OAuth provider
- Not in initial scope

## Testing Strategy
- Unit tests for OAuth button component
- Unit tests for callback route
- Mock Supabase auth responses

## Dependencies
- Supabase project configured with Google and GitHub providers
- OAuth credentials in Supabase dashboard
