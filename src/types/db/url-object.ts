import {QrCode} from "@/types/db/qr-code";
import {Alias} from "@/types/db/alias";

export interface UrlObject {
    id: number;
    uuid: string;
    url: string;
    identifier: string;
    enabled: boolean;
    qr_codes: QrCode | null;
    aliases: Alias | null;
}