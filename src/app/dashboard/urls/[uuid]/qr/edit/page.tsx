import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import QrEditForm from '@/components/qr-edit-form';
import { QrCodeSettings } from '@/types/db/qr-code';

export default async function EditQrCodePage({
  params
}:{
    params: Promise<{ uuid: string }>
}): Promise<React.ReactNode> {
    const { uuid } = await params;
    const supabase = await createClient();
    
    const { data: url, error: urlError } = await supabase.from('url_objects')
        .select('id, url')
        .eq('uuid', uuid)
        .maybeSingle();

    if (urlError || !url) {
        notFound();
    }
    
    const { data: qrCodes, error: qrError } = await supabase.from('qr_codes')
    .select('id, settings')
    .eq('url_object_id', url.id);
    
    if (qrError || !qrCodes || qrCodes.length === 0) {
        return (
            <div className="prose mx-auto text-center mt-20">
                <h1>No QR Code Yet</h1>
                <p className="text-sm opacity-70">{url.url}</p>
                
                <div className="alert alert-info max-w-md mx-auto mt-8">
                    <span>This URL does not have a QR code associated with it yet.</span>
                </div>
                
                <div className="mt-8 flex flex-col gap-4 max-w-md mx-auto">
                    <Link href={`/dashboard/urls/${uuid}/qr/new`} className="btn btn-primary">
                        Create QR Code
                    </Link>
                    <Link href={'/dashboard/urls'} className="btn btn-outline">
                        Back to URLs
                    </Link>
                </div>
            </div>
        );
    }

    const qrCode = qrCodes[0];
    const settings = qrCode.settings as QrCodeSettings | null;

    return (
        <div className="max-w-6xl mx-auto mt-8">
            <div className="text-center mb-8">
                <h1>Edit QR Code</h1>
                <p className="text-sm opacity-70">{url.url}</p>
            </div>
            
            <QrEditForm 
                qrCodeId={qrCode.id} 
                initialSettings={settings}
            />
            
            <div className="text-center mt-8">
                <a href={'/dashboard/urls'} className="btn btn-outline">
                    Back to URLs
                </a>
            </div>
        </div>
    );
}
