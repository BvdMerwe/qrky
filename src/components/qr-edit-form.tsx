"use client";

import React, { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import { updateQrCode } from "@/app/dashboard/urls/[uuid]/qr/edit/actions";
import { QrCodeSettings } from "@/types/db/qr-code";

interface QrEditFormProps {
    qrCodeId: string;
    initialSettings: QrCodeSettings | null;
}

const DEFAULT_FG_COLOR = "#000000";
const DEFAULT_BG_COLOR = "#ffffff";
const DEFAULT_CORNER_RADIUS = 0.45;
const DEFAULT_LOGO_SCALE = 0.2;

export default function QrEditForm({ qrCodeId, initialSettings }: QrEditFormProps): React.ReactNode {
    const [fgColor, setFgColor] = useState(initialSettings?.fgColor || DEFAULT_FG_COLOR);
    const [bgColor, setBgColor] = useState(initialSettings?.bgColor || DEFAULT_BG_COLOR);
    const [cornerRadius, setCornerRadius] = useState(initialSettings?.cornerRadius ?? DEFAULT_CORNER_RADIUS);
    const [logoScale, setLogoScale] = useState(initialSettings?.logoScale ?? DEFAULT_LOGO_SCALE);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(initialSettings?.logoUrl || null);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        const params = new URLSearchParams({
            fg: fgColor.replace("#", ""),
            bg: bgColor.replace("#", ""),
            cr: cornerRadius.toString(),
            ls: logoScale.toString(),
        });
        if (initialSettings?.logoUrl) {
            params.set("logo", initialSettings.logoUrl);
        }
        
        const timer = setTimeout(() => {
            setPreviewUrl(`/qr/${qrCodeId}?${params.toString()}`);
        }, 300);
        
        return () => clearTimeout(timer);
    }, [qrCodeId, fgColor, bgColor, cornerRadius, logoScale, initialSettings?.logoUrl]);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validTypes = ["image/svg+xml", "image/png", "image/jpeg", "image/jpg"];
        if (!validTypes.includes(file.type)) {
            setError("Only SVG, PNG, and JPG files are allowed");
            return;
        }

        if (file.size > 500 * 1024) {
            setError("File size must be less than 500KB");
            return;
        }

        setError(null);
        setLogoFile(file);

        const reader = new FileReader();
        reader.onload = (e) => {
            setLogoPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (formData: FormData) => {
        setError(null);
        setSuccess(false);

        formData.append("qr_code_id", qrCodeId);
        formData.append("fg_color", fgColor);
        formData.append("bg_color", bgColor);
        formData.append("corner_radius", cornerRadius.toString());
        formData.append("logo_scale", logoScale.toString());

        if (logoFile) {
            formData.append("logo", logoFile);
        }

        startTransition(async () => {
            try {
                await updateQrCode(formData);
                setSuccess(true);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to save settings");
            }
        });
    };

    return (
        <form action={handleSubmit} className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto mt-8">
            <div className="flex-1 card bg-base-200 p-6 text-left">
                <h3 className="card-title text-xl mb-6">QR Code Settings</h3>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Foreground Color</span>
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={fgColor}
                                onChange={(e) => setFgColor(e.target.value)}
                                className="w-12 h-12 rounded cursor-pointer"
                            />
                            <input
                                type="text"
                                value={fgColor}
                                onChange={(e) => setFgColor(e.target.value)}
                                className="input input-bordered flex-1"
                                placeholder="#000000"
                            />
                        </div>
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Background Color</span>
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={bgColor}
                                onChange={(e) => setBgColor(e.target.value)}
                                className="w-12 h-12 rounded cursor-pointer"
                            />
                            <input
                                type="text"
                                value={bgColor}
                                onChange={(e) => setBgColor(e.target.value)}
                                className="input input-bordered flex-1"
                                placeholder="#ffffff"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-control mb-6">
                    <label className="label">
                        <span className="label-text">Corner Radius: {cornerRadius}</span>
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="0.5"
                        step="0.05"
                        value={cornerRadius}
                        onChange={(e) => setCornerRadius(parseFloat(e.target.value))}
                        className="range range-primary"
                    />
                    <div className="flex justify-between text-xs opacity-50 mt-1">
                        <span>Square (0)</span>
                        <span>Round (0.5)</span>
                    </div>
                </div>

                <div className="form-control mb-6">
                    <label className="label">
                        <span className="label-text">Logo Scale: {Math.round(logoScale * 100)}%</span>
                    </label>
                    <input
                        type="range"
                        min="0.1"
                        max="0.3"
                        step="0.05"
                        value={logoScale}
                        onChange={(e) => setLogoScale(parseFloat(e.target.value))}
                        className="range range-primary"
                    />
                    <div className="flex justify-between text-xs opacity-50 mt-1">
                        <span>10%</span>
                        <span>30%</span>
                    </div>
                </div>

                <div className="form-control mb-6">
                    <label className="label">
                        <span className="label-text">Logo (optional)</span>
                    </label>
                    <input
                        type="file"
                        accept="image/svg+xml,image/png,image/jpeg,image/jpg"
                        onChange={handleLogoChange}
                        className="file-input file-input-bordered w-full"
                    />
                    <label className="label">
                        <span className="label-text-alt">SVG, PNG, JPG - max 500KB</span>
                    </label>
                </div>

                {logoPreview && (
                    <div className="form-control mb-6">
                        <label className="label">
                            <span className="label-text">Logo Preview</span>
                        </label>
                        <div className="w-24 h-24 rounded border p-2 bg-base-100">
                            <Image src={logoPreview} alt="Logo preview" width={80} height={80} className="w-full h-full object-contain" unoptimized />
                        </div>
                    </div>
                )}

                {error && (
                    <div className="alert alert-error mb-4">
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="alert alert-success mb-4">
                        <span>Settings saved successfully!</span>
                    </div>
                )}

                <div className="flex gap-2">
                    <button type="submit" className="btn btn-primary flex-1" disabled={isPending}>
                        {isPending ? (
                            <>
                                <span className="loading loading-spinner loading-sm"></span>
                                Saving...
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </button>
                </div>
            </div>

            <div className="flex-1">
                <h3 className="text-xl font-bold mb-4">Preview</h3>
                <div className="bg-base-200 p-8 rounded-lg flex items-center justify-center min-h-[300px]">
                    {previewUrl && (
                        <div className="bg-white p-4 rounded shadow-lg">
                            <Image
                                src={previewUrl}
                                alt="QR Code Preview"
                                width={250}
                                height={250}
                                className="rounded"
                                unoptimized
                            />
                        </div>
                    )}
                </div>
                <p className="text-sm mt-4 text-center opacity-70">
                    Preview updates automatically as you change settings
                </p>
            </div>
        </form>
    );
}
