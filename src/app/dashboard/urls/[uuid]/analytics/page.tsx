import React from "react";
import { createClient } from "@/lib/supabase/server";
import { formatDistanceToNow } from "date-fns";

export default async function UrlAnalyticsPage({
    params
}: {
    params: Promise<{ uuid: string }>
}) {
    const { uuid } = await params;
    const supabase = await createClient();

    // Fetch URL data
    const { data: url, error: urlError } = await supabase
        .from("url_objects")
        .select("*")
        .eq("uuid", uuid)
        .maybeSingle();

    if (urlError || !url) {
        return (
            <div className="prose flex flex-col w-full h-screen justify-center container mx-auto">
                <h1>URL Not Found</h1>
                <p>The URL you are looking for does not exist.</p>
            </div>
        );
    }

    // Fetch related QR codes and aliases separately
    const { data: qrCodes } = await supabase
        .from("qr_codes")
        .select("id")
        .eq("url_object_id", url.id);
    
    const { data: aliases } = await supabase
        .from("aliases")
        .select("id")
        .eq("url_object_id", url.id);

    const qrCodeIds = qrCodes?.map((qr: { id: string }) => qr.id) || [];
    const aliasIds = aliases?.map((alias: { id: string }) => alias.id) || [];

    const { data: directVisits } = await supabase
        .from("visits")
        .select("*")
        .eq("url_object_id", url.id);

    const { data: qrVisits } = qrCodeIds.length > 0
        ? await supabase
            .from("visits")
            .select("*")
            .in("qr_code_id", qrCodeIds)
        : { data: [] };

    const { data: aliasVisits } = aliasIds.length > 0
        ? await supabase
            .from("visits")
            .select("*")
            .in("alias_id", aliasIds)
        : { data: [] };

    const allVisits = [...(directVisits || []), ...(qrVisits || []), ...(aliasVisits || [])];
    const visits = allVisits || [];
    const totalVisits = visits.length;

    const sortedVisits = [...visits].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const recentVisits = sortedVisits.slice(0, 20);

    return (
        <div className="container mx-auto p-4">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Analytics</h1>
                <p className="text-base-content/70">{url.url}</p>
            </div>

            <div className="stats shadow mb-6">
                <div className="stat">
                    <div className="stat-title">Total Visits</div>
                    <div className="stat-value text-secondary">{totalVisits}</div>
                </div>
            </div>

            <div className="card bg-base-200">
                <div className="card-body">
                    <h2 className="card-title">Recent Visits</h2>
                    {recentVisits.length === 0 ? (
                        <p className="text-base-content/70">No visits yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table table-zebra">
                                <thead>
                                    <tr>
                                        <th>Time</th>
                                        <th>Type</th>
                                        <th>User Agent</th>
                                        <th>Country</th>
                                        <th>Region</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentVisits.map((visit) => (
                                        <tr key={visit.id}>
                                            <td>
                                                {formatDistanceToNow(
                                                    new Date(visit.created_at),
                                                    { addSuffix: true }
                                                )}
                                            </td>
                                            <td>
                                                {visit.url_object_id ? "Direct" 
                                                    : visit.qr_code_id ? "QR Code" 
                                                    : visit.alias_id ? "Alias" 
                                                    : "Unknown"}
                                            </td>
                                            <td className="max-w-xs truncate" title={visit.user_agent}>
                                                {visit.user_agent || "Unknown"}
                                            </td>
                                            <td>{visit.country || "Unknown"}</td>
                                            <td>{visit.region || "Unknown"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
