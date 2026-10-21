'use client';

import { useEffect, useState } from 'react';

interface Stats {
    visitCount: number;
    urlCount: number;
    userCount: number;
}

export default function StatsSection() {
    const [stats, setStats] = useState<Stats | null>(null);

    useEffect(() => {
        fetch('/api/stats')
            .then((res) => res.json())
            .then(setStats)
            .catch(() => {
                // Silently fail — stats are non-critical
            });
    }, []);

    const urlCount = stats?.urlCount ?? '—';
    const visitCount = stats?.visitCount ?? '—';
    const userCount = stats?.userCount ?? '—';

    return (
        <section className="py-16 bg-base-300 font-title">
            <div className="container mx-auto px-4">
                <div className="stats stats-vertical lg:stats-horizontal shadow-lg bg-base-100 w-full">
                    <div className="stat place-items-center">
                        <div className="stat-title font-semibold">URLs Shortened</div>
                        <div className="stat-value text-primary-content">{urlCount}</div>
                        <div className="stat-desc">and counting</div>
                    </div>
                    <div className="stat place-items-center">
                        <div className="stat-title font-semibold">Total Redirects</div>
                        <div className="stat-value text-secondary-content">{visitCount}</div>
                        <div className="stat-desc">across all URLs</div>
                    </div>
                    <div className="stat place-items-center">
                        <div className="stat-title font-semibold">Active Users</div>
                        <div className="stat-value text-accent-content">{userCount}</div>
                        <div className="stat-desc">worldwide</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
