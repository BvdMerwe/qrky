import { createClient } from '@/lib/supabase/server';
import { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers';
import { enrichVisit } from '@/lib/enrich-visit';

export default async function recordView(
    headers: ReadonlyHeaders,
    objectType: 'qr_codes' | 'aliases' | 'url_objects',
    identifier: string
): Promise<void> {
    const supabase = await createClient();
    const { ipHash, country, region } = await enrichVisit(headers);
    const userAgent = headers.get('user-agent') ?? '';

    await supabase.rpc('record_view', {
        objecttype: objectType,
        identifier,
        ip_hash: ipHash,
        useragent: userAgent,
        country,
        region,
    });
}
