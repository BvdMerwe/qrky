'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TbPencil, TbQrcode, TbDownload } from 'react-icons/tb';
import { hashString } from '@/lib/strings';

interface Props {
    qrCodeUuid: string;
    urlUuid: string;
    cacheKey: string
}

export default function QrCodePreview({ qrCodeUuid, urlUuid, cacheKey }: Props): React.ReactNode {
    const modalRef = useRef<HTMLDialogElement>(null);
    const qrCodeUrl = `/qr/${qrCodeUuid}`;
    const shortUrl = `${process.env.NEXT_PUBLIC_APP_URL}/q/${qrCodeUuid}`;
    const [cacheKeyEncoded, setCacheKeyEncoded] = useState<string>();

    useEffect(() => {
        hashString(cacheKey).then(setCacheKeyEncoded);
    }, [cacheKey]);

    return (
        <>
            <button 
                className="btn btn-soft btn-primary btn-xs tooltip tooltip-top" 
                data-tip="View QR code" 
                onClick={() => modalRef?.current?.showModal()}
            >
                <TbQrcode/>
            </button>
            
            <dialog id={`qr-preview-modal-${qrCodeUuid}`} className="modal" ref={modalRef}>
                <div className="modal-box max-w-2xl">
                    <h3 className="font-bold text-lg mb-4">QR Code Preview</h3>
                    
                    <div className="flex flex-col items-center gap-4">
                        <div className="bg-white p-4 rounded-lg shadow-inner">
                            <Image 
                                src={`${qrCodeUrl}?ck=${cacheKeyEncoded ?? '0'}`}
                                alt="QR Code" 
                                width={300} 
                                height={300}
                                className="rounded"
                            />
                        </div>
                        
                        <div className="text-center">
                            <p className="text-sm opacity-70">QR Code URL:</p>
                            <code className="text-xs bg-base-200 px-2 py-1 rounded">{shortUrl}</code>
                        </div>
                        
                        <div className="flex gap-2 mt-4">
                            <a 
                                href={qrCodeUrl} 
                                download={`qrky-qr-${qrCodeUuid}.jpg`}
                                className="btn btn-primary btn-sm"
                            >
                                <TbDownload className="mr-2"/>
                                Download
                            </a>
                            <Link 
                                href={`/dashboard/urls/${urlUuid}/qr/edit`}
                                className="btn btn-outline btn-sm"
                            >
                                <TbPencil className="mr-2"/>
                                Edit
                            </Link>
                        </div>
                    </div>
                    
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn">Close</button>
                        </form>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>Close</button>
                </form>
            </dialog>
        </>
    );
}
