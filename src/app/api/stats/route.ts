import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_ADMIN_KEY!
    );

    const [visitResult, urlResult, userResult] = await Promise.all([
        supabase.from('visits').select('*', { count: 'planned', head: true }),
        supabase.from('url_objects').select('*', { count: 'planned', head: true }),
        supabase.from('url_objects').select('*', { count: 'exact', head: true }),
    ]);

    return NextResponse.json({
        visitCount: visitResult.count ?? 0,
        urlCount: urlResult.count ?? 0,
        userCount: userResult.count ?? 0,
    });
}
