---
invokable: true
---

Review the changed code for potential issues, including:

## TypeScript & Type Safety
- **Strict type checking**: Ensure no `any` types or type assertions without justification
- **Async/await patterns**: Verify proper error handling and Promise resolution
- **Type imports**: Check that types from `@chillerlan/qrcode` are correctly imported
- **Server vs. Client components**: Ensure proper use of Next.js 16 App Router patterns

## Next.js App Router Patterns
- **Server component usage**: Verify components are server components by default
- **Client component boundaries**: Check `"use client"` directives are only where needed
- **Async page components**: Ensure page components properly await params/searchParams
- **Redirect usage**: Confirm `redirect()` is used correctly with proper `RedirectType`
- **Cookie handling**: Verify async `cookies()` and `headers()` usage

## Supabase Integration
- **Server-side client usage**: Ensure `createClient()` from `server.ts` is used in server components
- **Query patterns**: Check `.maybeSingle()` usage for optional results
- **Error handling**: Verify `PostgrestError` is properly handled
- **RPC calls**: Validate `record_view()` RPC function is called with correct parameters
- **Environment variables**: Confirm `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ADMIN_KEY` are used

## QR Code Library
- **Options validation**: Ensure `QRkyOptions` validates all custom options (circleRadius, svgLogo, etc.)
- **File system access**: Check `fs` operations are server-side only and include error handling
- **SVG generation**: Verify proper path generation and corner rounding logic
- **Module type detection**: Validate neighbor detection uses correct binary flags (8,4,2,1)
- **Logo embedding**: Check logo scale is clamped between min/max values

## Performance & Security
- **File path validation**: Ensure SVG logo paths are validated with `existsSync()` and `accessSync()`
- **SQL injection**: Verify Supabase queries use parameterized inputs
- **XSS prevention**: Check SVG content is properly sanitized
- **Memory leaks**: Validate no lingering file handles or unclosed connections
- **Response headers**: Ensure proper Content-Type headers for SVG routes

## Code Quality
- **Error messages**: Check errors provide actionable context
- **Console logs**: Remove debug `console.log()` statements (especially in `QRkySVG.ts`)
- **Dead code**: Identify commented-out code that should be removed
- **DRY principle**: Look for repeated logic that could be extracted
- **Naming conventions**: Verify consistent camelCase for variables, PascalCase for components

## Documentation
- **JSDoc comments**: Check complex functions have proper documentation
- **README accuracy**: Ensure inline comments match actual behavior
- **Type definitions**: Verify custom types in `types/` directory are up-to-date

Provide specific, actionable feedback for improvements.
