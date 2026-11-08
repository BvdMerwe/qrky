import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { cache } from 'react';

export const createClient = cache(async () => {
    const cookieStore = await cookies();
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_ADMIN_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        throw new Error('Cookies are not available');
                    }
                },
            },
        },
    );
});

/**
 * Service-role client that does NOT read auth cookies.
 * Use this for public lookups (e.g. redirect pages) so that
 * RLS is evaluated as anon/service-role rather than the
 * logged-in user, whose personal policies may hide public rows.
 */
export const createServiceClient = () => {
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_ADMIN_KEY!,
        {
            cookies: {
                getAll() {
                    return [];
                },
                setAll() {
                    // no-op — public redirect lookups never write cookies
                },
            },
        },
    );
};
