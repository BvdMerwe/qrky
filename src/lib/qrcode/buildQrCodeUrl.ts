
export function buildQrCodeUrl(data: string): string {
    return `${process.env.NEXT_PUBLIC_APP_URL}/q/${data}`;
}