import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_ADMIN_KEY!
    );

    const [visitResult, urlResult, userResult] = await Promise.all([
        supabase.rpc('get_total_click_count'),
        supabase.from('url_objects').select('*', { count: 'planned', head: true }),
        supabase.rpc('get_user_count')
    ]);

    return NextResponse.json({
        visitCount: visitResult.data ?? 0,
        urlCount: urlResult.count ?? 0,
        userCount: userResult.data ?? 0,
    });
}
