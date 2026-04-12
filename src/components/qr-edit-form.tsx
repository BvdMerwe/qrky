'use client';

import React, { useState, useEffect, useTransition, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { ColorPicker, ColorService, IColor } from 'react-color-palette';
import 'react-color-palette/css';
import { updateQrCode } from '@/app/dashboard/urls/[uuid]/qr/edit/actions';
import { QrCodeSettings } from '@/types/db/qr-code';
import { buildQrCodeUrl } from '@/lib/qrcode/buildQrCodeUrl';

interface QrEditFormProps {
    qrCodeId: string;
    initialSettings: QrCodeSettings | null;
}

const DEFAULT_FG_COLOR = '#000000';
const DEFAULT_BG_COLOR = '#ffffff';
const DEFAULT_CORNER_RADIUS = 0.45;
const DEFAULT_LOGO_SCALE = 0.2;

interface ColorSwatchPickerProps {
    label: string;
    color: string;
    onChange: (hex: string) => void;
}

function ColorSwatchPicker({ label, color, onChange }: ColorSwatchPickerProps) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Derive iColor from hex prop; fall back gracefully on invalid input
    const iColor = useMemo<IColor>(() => {
        if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
            return ColorService.convert('hex', color);
        }
        return ColorService.convert('hex', '#000000');
    }, [color]);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        function handleClick(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);

    const handlePickerChange = useCallback((c: IColor) => {
        onChange(c.hex);
    }, [onChange]);

    return (
        <div className="form-control relative" ref={containerRef}>
            <label className="label">
                <span className="label-text">{label}</span>
            </label>
            <div className="flex gap-2 items-center">
                <button
                    type="button"
                    className="btn btn-square btn-sm border border-base-300 w-10 h-10 rounded shrink-0"
                    style={{ backgroundColor: color }}
                    onClick={() => setOpen((o) => !o)}
                    aria-label={`Pick ${label}`}
                />
                <input
                    type="text"
                    value={color}
                    onChange={(e) => onChange(e.target.value)}
                    className="input input-bordered flex-1"
                    placeholder="#000000"
                    maxLength={7}
                />
            </div>
            {open && (
                <div className="absolute top-full left-0 z-50 mt-1 shadow-xl rounded-lg bg-base-100 p-3 border border-base-300">
                    <ColorPicker
                        height={150}
                        hideAlpha
                        color={iColor}
                        onChange={handlePickerChange}
                    />
                </div>
            )}
        </div>
    );
}

export default function QrEditForm({ qrCodeId, initialSettings }: QrEditFormProps): React.ReactNode {
    const [fgColor, setFgColor] = useState(initialSettings?.fgColor || DEFAULT_FG_COLOR);
    const [bgColor, setBgColor] = useState(initialSettings?.bgColor || DEFAULT_BG_COLOR);
    const [cornerRadius, setCornerRadius] = useState(initialSettings?.cornerRadius ?? DEFAULT_CORNER_RADIUS);
    const [logoScale, setLogoScale] = useState(initialSettings?.logoScale ?? DEFAULT_LOGO_SCALE);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(initialSettings?.logoUrl || null);
    const [clearLogo, setClearLogo] = useState(false);
    const [clearLogoSpace, setClearLogoSpace] = useState(initialSettings?.clearLogoSpace ?? false);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        const params = new URLSearchParams({
            fg: fgColor.replace('#', ''),
            bg: bgColor.replace('#', ''),
            cr: cornerRadius.toString(),
            ls: logoScale.toString(),
            data: buildQrCodeUrl(qrCodeId),
        });
        // Use logo from new file preview, or existing URL (unless being cleared)
        const effectiveLogoUrl = clearLogo ? null : (logoFile ? null : initialSettings?.logoUrl);
        if (effectiveLogoUrl) {
            params.set('logo', effectiveLogoUrl);
        }
        if (clearLogoSpace) {
            params.set('cls', '1');
        }
        
        const timer = setTimeout(() => {
            setPreviewUrl(`/api/qr/preview?${params.toString()}`);
        }, 300);
        
        return () => clearTimeout(timer);
    }, [qrCodeId, fgColor, bgColor, cornerRadius, logoScale, initialSettings?.logoUrl, clearLogo, logoFile, clearLogoSpace]);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validTypes = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            setError('Only SVG, PNG, and JPG files are allowed');
            return;
        }

        if (file.size > 500 * 1024) {
            setError('File size must be less than 500KB');
            return;
        }

        setError(null);
        setLogoFile(file);
        setClearLogo(false); // new upload cancels any pending removal

        const reader = new FileReader();
        reader.onload = (e) => {
            setLogoPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveLogo = () => {
        setClearLogo(true);
        setLogoFile(null);
        setLogoPreview(null);
    };

    const handleSubmit = async (formData: FormData) => {
        setError(null);
        setSuccess(false);

        formData.append('qr_code_id', qrCodeId);
        formData.append('fg_color', fgColor);
        formData.append('bg_color', bgColor);
        formData.append('corner_radius', cornerRadius.toString());
        formData.append('logo_scale', logoScale.toString());
        formData.append('clear_logo', clearLogo.toString());
        formData.append('clear_logo_space', clearLogoSpace.toString());

        if (logoFile) {
            formData.append('logo', logoFile);
        }

        startTransition(async () => {
            try {
                await updateQrCode(formData);
                setSuccess(true);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to save settings');
            }
        });
    };

    return (
        <form action={handleSubmit} className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto mt-8">
            <div className="flex-1 card bg-base-200 p-6 text-left">
                <h3 className="card-title text-xl mb-6">QR Code Settings</h3>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <ColorSwatchPicker
                        label="Foreground Color"
                        color={fgColor}
                        onChange={setFgColor}
                    />
                    <ColorSwatchPicker
                        label="Background Color"
                        color={bgColor}
                        onChange={setBgColor}
                    />
                </div>

                <div className="form-control mb-6">
                    <label className="label">
                        <span className="label-text">Corner Radius: {cornerRadius}</span>
                    </label>
                    <div>
                        <input
                            type="range"
                            min="0"
                            max="0.5"
                            step="0.0001"
                            value={cornerRadius}
                            onChange={(e) => setCornerRadius(parseFloat(e.target.value))}
                            className="range range-primary w-full"
                        />
                    </div>
                    <div className="flex justify-between text-xs opacity-50 mt-1">
                        <span>Square (0)</span>
                        <span>Round (0.5)</span>
                    </div>
                </div>

                <div className="form-control mb-6">
                    <label className="label">
                        <span className="label-text">Logo Scale: {Math.round(logoScale * 100)}%</span>
                    </label>
                    <div>
                        <input
                            type="range"
                            min="0.1"
                            max="0.35"
                            step="0.001"
                            value={logoScale}
                            onChange={(e) => setLogoScale(parseFloat(e.target.value))}
                            className="range range-primary w-full"
                        />
                    </div>
                    <div className="flex justify-between text-xs opacity-50 mt-1">
                        <span>10%</span>
                        <span>35%</span>
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
                        <div className="flex items-center gap-4">
                            <div className="w-24 h-24 rounded border p-2 bg-base-100">
                                <Image src={logoPreview} alt="Logo preview" width={80} height={80} className="w-full h-full object-contain" unoptimized />
                            </div>
                            <button
                                type="button"
                                className="btn btn-sm btn-error btn-outline"
                                onClick={handleRemoveLogo}
                            >
                                Remove Logo
                            </button>
                        </div>
                    </div>
                )}

                <div className="form-control mb-6">
                    <label className="label cursor-pointer justify-start gap-3">
                        <input
                            type="checkbox"
                            className="checkbox checkbox-sm"
                            checked={clearLogoSpace}
                            onChange={(e) => setClearLogoSpace(e.target.checked)}
                        />
                        <span className="label-text">Reserve logo space (blank area even without a logo)</span>
                    </label>
                </div>

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
                            'Save Changes'
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
