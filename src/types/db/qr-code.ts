export interface QrCodeSettings {
    logo: string | null; // Data URL for logo.
    logoSize: number | null; // Percentage size compared to QR code.
}

export interface QrCode {
    id: string; // UUID
    settings: QrCodeSettings;
}