import React from 'react';
import { fetchUrlsServer } from '@/app/dashboard/urls/actions-server';
import UrlTableComponent from '@/app/dashboard/urls/components/UrlTable';

export default async function UrlsPage(): Promise<React.ReactNode> {
    const urls = await fetchUrlsServer();

    return (
        <div className="mt-20">
            <div className="prose mb-4">
                <h1>Your URLs: </h1> 
            </div>
            <UrlTableComponent urlsInitial={urls ?? null} />
        </div>
    );
}