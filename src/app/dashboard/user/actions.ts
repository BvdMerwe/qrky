"use server"

import {createClient} from "@/lib/supabase/server";
import {redirect, RedirectType} from "next/navigation";
import {stringIsValid} from "@/lib/strings";
import {ActionResponseInterface} from "@/interfaces/action-response";
import {authGeneratePasswordFormula, authIsPasswordValid} from "@/lib/auth";

const TEXT_SUCCESS_CHANGED = "Woohoo! Your password has been changed.";
const TEXT_SUCCESS_USER_UPDATED = "Your user has been updated.";
const TEXT_ERROR_MISSING_FIELDS = "None of the fields can be empty.";
const TEXT_ERROR_PASSWORD_MISMATCH = "New passwords do not match.";
const TEXT_ERROR_NAMES_INVALID = "First name or last name is invalid:";

export async function changePassword(_state: ActionResponseInterface, formData: FormData): Promise<ActionResponseInterface> {
    const supabase = await createClient();
    const code = formData.get('code') as string

    if (stringIsValid(code)) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
            return { message: error.message, success: false };
        }
    }

    const data = {
        securityCode: formData.get('securityCode') as string,
        newPassword: formData.get('newPassword') as string,
        confirmNewPassword: formData.get('confirmNewPassword') as string,
    }

    if (!stringIsValid(data.newPassword) || !stringIsValid(data.securityCode) || !stringIsValid(data.confirmNewPassword)) {
        return { message: TEXT_ERROR_MISSING_FIELDS, success: false };
    } else if (!authIsPasswordValid(data.newPassword)) {
        return { message: authGeneratePasswordFormula(), success: false };
    } else if (data.newPassword !== data.confirmNewPassword) {
        return { message: TEXT_ERROR_PASSWORD_MISMATCH, success: false };
    }


    const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword,
        nonce: data.securityCode,
    });

    if (updateError) {
        return { message: updateError.message, success: false };
    }

    return { message: TEXT_SUCCESS_CHANGED, success: true };
}

export async function saveUser(_state: ActionResponseInterface, formData: FormData): Promise<ActionResponseInterface> {
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');

    if (!stringIsValid(firstName) || !stringIsValid(lastName)) {
        return { message: `${TEXT_ERROR_NAMES_INVALID} "${firstName}" "${lastName}"`, success: false };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user !== null) {
         await supabase.auth.updateUser({
            data: {
                ...user.user_metadata,
                first_name: firstName,
                last_name: lastName,
            }
        });

         return { message: TEXT_SUCCESS_USER_UPDATED, success: true };
    } else {
        redirect("/login", RedirectType.push);
    }
}