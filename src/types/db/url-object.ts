import { QrCode } from '@/types/db/qr-code';
import { Alias } from '@/types/db/alias';

export interface UrlObject {
    id: number;
    uuid: string;
    url: string;
    identifier: string;
    enabled: boolean;
    click_count: number;
    qr_codes: QrCode[];
    aliases: Alias[];
}