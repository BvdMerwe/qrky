import { UrlObject } from '@/types/db/url-object';
import { createClient } from '@/lib/supabase/server';
import { fetchUrls } from '@/app/dashboard/urls/actions';

export async function fetchUrlsServer(): Promise<UrlObject[]> {
    const supabase = await createClient();
    return fetchUrls(supabase);
}