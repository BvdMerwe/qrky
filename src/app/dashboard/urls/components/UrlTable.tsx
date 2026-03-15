"use client"

import React, {useCallback, useState} from "react";
import TableComponent, {TableProps} from "@/components/ui/table";
import {UrlObject} from "@/types/db/url-object";
import {TbExternalLink, TbGraph, TbPencil, TbPlus} from "react-icons/tb";
import Link from "next/link";
import {deleteUrl, fetchUrlsBrowser, toggleEnabled} from "@/app/dashboard/urls/actions-browser";
import CopyToClipboardComponent from "@/components/ui/copy-to-clipboard";
import DeleteButtonComponent from "@/app/dashboard/urls/components/DeleteButton";
import QrCodePreviewComponent from "./QrCodePreview";

interface Props extends TableProps {
    urlsInitial: UrlObject[];
}

export default function UrlTableComponent({
  urlsInitial
}: Props): React.ReactNode {
    const [urls, setUrls] = useState<UrlObject[]>(urlsInitial);
    const toggleUrlEnabled = useCallback(async (uuid: string) => {
        await toggleEnabled(uuid);
        setUrls(await fetchUrlsBrowser());
    }, []);
    const deleteUrlAction = useCallback(async (uuid: string) => {
        console.log("deleteUrlAction", uuid);
        await deleteUrl(uuid);
        console.log("deleteUrlAction done");
        setUrls(await fetchUrlsBrowser());
    }, []);

    return (
        <TableComponent>
            {/* head */}
            <thead>
            <tr>
                <th>URL</th>
                <th>Enabled</th>
                <th>Shortened URL</th>
                <th>QR Code</th>
                <th>Alias</th>
                <th>
                    <Link className="btn btn-primary btn-xs" href="/dashboard/urls/new">
                        <TbPlus/>
                        Add A URL
                    </Link>
                </th>
            </tr>
            </thead>
            <tbody>
            {urls?.length === 0 &&
                <tr>
                    <td colSpan={100} className="text-center">
                        <h2>You don&apos;t have any URLs!</h2>

                        <Link className="btn btn-soft btn-primary btn-xs" href="/dashboard/urls/new">
                            <TbPlus/>
                            Add A URL
                        </Link>
                    </td>
                </tr>
            }

            {urls?.map(url => (
                <tr key={url.uuid}>
                    <td>
                        <Link
                            className="text-accent font-bold text-nowrap"
                            href={url.url}
                            title={url.url}
                            prefetch={false}
                            target="_blank"
                        >
                            <span className="truncate elipses align-middle inline-block max-w-xs">{url.url}</span> <TbExternalLink className="inline"/>
                        </Link>
                    </td>

                    <td>
                        <input type="checkbox" checked={url.enabled} className="toggle toggle-success" onChange={() => toggleUrlEnabled(url.uuid)}/>
                    </td>

                    <td>
                        {url.enabled
                            ? <CopyToClipboardComponent
                                value={`${process.env.NEXT_PUBLIC_APP_URL}/u/${url?.identifier}`}
                            >
                                <>/u/{url.identifier}</>
                            </CopyToClipboardComponent>
                            : <b>/u/{url.identifier}</b>
                        }
                    </td>

                    <td>
                        {url.qr_codes === null || typeof url.qr_codes === "undefined"
                            ? <Link className="btn btn-soft btn-primary btn-xs tooltip tooltip-top" data-tip="Add a QR code" href={`/dashboard/urls/${url.uuid}/qr/new`}>
                                <TbPlus/>
                            </Link>
                            : <QrCodePreviewComponent 
                                qrCodeId={url.qr_codes.id} 
                                urlIdentifier={url.identifier}
                            />
                        }
                    </td>

                    <td>
                        {url.aliases === null || typeof url.aliases === "undefined"
                            ? <Link className="btn btn-soft btn-primary btn-xs tooltip tooltip-top" data-tip="Add an alias" href={`/dashboard/urls/${url.uuid}/alias/new`}>
                                <TbPlus/>
                            </Link>
                            : <CopyToClipboardComponent value={`${process.env.NEXT_PUBLIC_APP_URL}/${url.aliases.value}`}><>/{url.aliases.value}</></CopyToClipboardComponent>}
                    </td>

                    <td>
                        <div className="join join-horizontal">
                            <Link className="btn btn-xs btn-soft btn-primary join-item tooltip tooltip-top" href={`/dashboard/urls/${url.uuid}/analytics`} data-tip="Analytics">
                                <TbGraph/>
                            </Link>
                            <Link className="btn btn-xs btn-soft btn-primary join-item tooltip tooltip-top" href={`/dashboard/urls/${url.uuid}/edit`} data-tip="Edit">
                                <TbPencil/>
                            </Link>
                            <DeleteButtonComponent onClick={() => deleteUrlAction(url.uuid)} />
                        </div>
                    </td>
                </tr>
            ))}
            </tbody>
        </TableComponent>
    );
}