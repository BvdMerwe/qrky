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
        <section className="py-16 bg-base-100">
            <div className="container mx-auto px-4">
                <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
                    <div className="stat place-items-center">
                        <div className="stat-title">URLs Shortened</div>
                        <div className="stat-value text-primary">{urlCount}</div>
                        <div className="stat-desc">And counting</div>
                    </div>
                    <div className="stat place-items-center">
                        <div className="stat-title">Total Visits</div>
                        <div className="stat-value text-secondary">{visitCount}</div>
                        <div className="stat-desc">Across all URLs</div>
                    </div>
                    <div className="stat place-items-center">
                        <div className="stat-title">Active Users</div>
                        <div className="stat-value text-accent">{userCount}</div>
                        <div className="stat-desc">Worldwide</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
