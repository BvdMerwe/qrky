import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { createQrCode } from './actions';

export default async function NewQrCodePage({
  params
}:{
    params: Promise<{ uuid: string }>
}): Promise<React.ReactNode> {
    const { uuid } = await params;
    const supabase = await createClient();
    const { data: url, error } = await supabase.from('url_objects')
        .select('uuid, url, identifier')
        .eq('uuid', uuid)
        .maybeSingle();

    if (error || !url) {
        throw new Error('URL not found');
    }

    return (
        <div className="prose mx-auto text-center mt-20">
            <h1>Create QR Code</h1>
            <p className="text-sm opacity-70">{url.url}</p>
            <p className="text-xs opacity-50">Short URL: /u/{url.identifier}</p>
            
            <form className="flex flex-col gap-4 max-w-md mx-auto mt-8" action={createQrCode}>
                <input type="hidden" name="uuid" value={uuid} />
                
                <div className="card bg-base-200 p-4">
                    <h3 className="card-title text-lg">QR Code Settings</h3>
                    <p className="text-sm opacity-70 mb-4">
                        QR code will be generated with default styling (rounded corners, QRky branding).
                    </p>
                    
                    <div className="form-control">
                        <label className="label cursor-pointer">
                            <span className="label-text">Use default settings</span>
                            <input type="checkbox" name="use_defaults" defaultChecked className="checkbox checkbox-primary" />
                        </label>
                    </div>
                </div>
                
                <button className="btn btn-primary">Create QR Code</button>
            </form>
        </div>
    );
}
