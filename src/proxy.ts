import {type NextRequest, NextResponse} from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest): Promise<NextResponse> {
    const {response, user} = await updateSession(request);

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
        // Don't match shortcode resolving URLs
        '/((?!u\/[a-z0-9\-]{6}))/',
        '/((?!q\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}))/',
        '/((?![a-z0-9\-]?))/',
        '/qr\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/',
        // Dont match utility pages
        '/((?!400|404|500))/',
    ],
}