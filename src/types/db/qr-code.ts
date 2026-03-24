export interface QrCodeSettings {
    fgColor: string | null; // Foreground color (hex).
    bgColor: string | null; // Background color (hex).
    cornerRadius: number | null; // Corner radius (0-0.5).
    logoUrl: string | null; // URL to logo in storage.
    logoScale: number | null; // Logo scale (0.1-0.3).
}

export interface QrCode {
    id: string; // UUID
    settings: QrCodeSettings;
}