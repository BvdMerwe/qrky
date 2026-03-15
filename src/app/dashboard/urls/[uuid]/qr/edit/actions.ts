"use server";

import {createClient} from "@/lib/supabase/server";
import {redirect, RedirectType} from "next/navigation";
import {revalidatePath} from "next/cache";

export async function updateQrCode(formData: FormData): Promise<void> {
    const qrCodeId = formData.get("qr_code_id") as string;
    const urlUuid = formData.get("url_uuid") as string;

    if (!qrCodeId) {
        throw new Error("Invalid input: missing QR code ID");
    }

    const supabase = await createClient();

    // For now, just verify the QR code exists and belongs to the user
    // In the future, this will update settings
    const { data: qrCode, error: fetchError } = await supabase
        .from("qr_codes")
        .select("id")
        .eq("id", qrCodeId)
        .single();

    if (fetchError || !qrCode) {
        console.error(fetchError?.message);
        throw new Error("QR code not found");
    }

    // TODO: Update settings when customization is implemented
    // const settings = {
    //     // Custom settings from form
    // };
    //
    // const { error } = await supabase
    //     .from("qr_codes")
    //     .update({ settings })
    //     .eq("id", qrCodeId);

    revalidatePath("/dashboard/urls");
    redirect("/dashboard/urls", RedirectType.push);
}
