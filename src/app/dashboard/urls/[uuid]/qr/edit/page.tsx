import React from "react";
import {createClient} from "@/lib/supabase/server";
import {notFound, redirect} from "next/navigation";
import Link from "next/link";
import {updateQrCode} from "./actions";

export default async function EditQrCodePage({
  params
}:{
    params: Promise<{ uuid: string}>
}): Promise<React.ReactNode> {
    const { uuid } = await params;
    const supabase = await createClient();
    
    // Fetch URL first
    const { data: url, error: urlError } = await supabase.from("url_objects")
        .select("uuid, url, identifier")
        .eq("uuid", uuid)
        .maybeSingle();

    if (urlError || !url) {
        notFound();
    }

    // Fetch QR code separately
    const { data: qrCodes, error: qrError } = await supabase.from("qr_codes")
        .select("id, settings")
        .eq("url_object_uuid", uuid);

    // If URL exists but has no QR code, show helpful message instead of 404
    if (!qrCodes || qrCodes.length === 0) {
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
                    <Link href={`/dashboard/urls`} className="btn btn-outline">
                        Back to URLs
                    </Link>
                </div>
            </div>
        );
    }

    const qrCode = qrCodes[0];

    return (
        <div className="prose mx-auto text-center mt-20">
            <h1>Edit QR Code</h1>
            <p className="text-sm opacity-70">{url.url}</p>
            
            <form className="flex flex-col gap-4 max-w-md mx-auto mt-8" action={updateQrCode}>
                <input type="hidden" name="qr_code_id" value={qrCode.id} />
                <input type="hidden" name="url_uuid" value={uuid} />
                
                <div className="card bg-base-200 p-4 text-left">
                    <h3 className="card-title text-lg mb-4">QR Code Settings</h3>
                    
                    <div className="form-control mb-4">
                        <label className="label">
                            <span className="label-text">QR Code ID</span>
                        </label>
                        <input 
                            type="text" 
                            value={qrCode.id} 
                            disabled 
                            className="input input-bordered w-full"
                        />
                    </div>
                    
                    <div className="alert alert-info">
                        <span>Current settings: {JSON.stringify(qrCode.settings)}</span>
                    </div>
                    
                    <p className="text-sm mt-4">
                        Advanced QR code customization options (colors, logo, etc.) coming soon.
                    </p>
                </div>
                
                <div className="flex gap-2">
                    <button type="submit" className="btn btn-primary flex-1">Save Changes</button>
                    <a href={`/dashboard/urls`} className="btn btn-outline flex-1">Cancel</a>
                </div>
            </form>
            
            <div className="mt-8">
                <h3 className="text-lg font-bold mb-4">QR Code Preview</h3>
                <div className="bg-white p-4 rounded-lg shadow-lg inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                        src={`/qr/${qrCode.id}`} 
                        alt="QR Code" 
                        width={200} 
                        height={200}
                        className="rounded"
                    />
                </div>
                <p className="text-sm mt-2">
                    <a href={`/qr/${qrCode.id}`} download className="btn btn-sm btn-outline">
                        Download QR Code
                    </a>
                </p>
            </div>
        </div>
    );
}
