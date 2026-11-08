import { PostgrestError } from '@supabase/supabase-js';
import { notFound, redirect, RedirectType } from 'next/navigation';
import recordView from '@/lib/record-view';
import { headers } from 'next/headers';

export default async function redirectUser(
    url: string | null,
    error: PostgrestError | null,
    source: 'qr_codes'|'aliases'|'url_objects',
    identifier: string,
): Promise<void> {
    if (error) {
        console.error((error as Error).message);
        redirect('/500', RedirectType.push);
    } else if (url === null) {
        // redirect to 404
        notFound();
    } else {
        // record view and redirect to actual URL
        // Failure must never block the redirect — analytics are best-effort.
        try {
            await recordView(await headers(), source, identifier);
        } catch (e) {
            console.error('recordView failed:', e);
        }
        redirect(url, RedirectType.replace);
    }
}