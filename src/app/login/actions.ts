'use server'

import {revalidatePath} from 'next/cache'
import {redirect} from 'next/navigation'

import {createClient} from '@/lib/supabase/server'
import {stringIsValid} from "@/lib/strings";
import {ErrorInterface} from "@/interfaces/error";
import {authIsPasswordValid} from "@/lib/auth";

export async function login(state: ErrorInterface | void, formData: FormData): Promise<ErrorInterface | void> {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    if (!stringIsValid(data.email) || !stringIsValid(data.password)) {
        return generateErrorGeneric();
    } else if (!authIsPasswordValid(data.password)) {
        return { message: `Password should contain at least 8 characters, an uppercase letter and lowercase letter, a number and a symbol.` };
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        if (error.code === 'invalid_credentials') {
            return generateErrorGeneric();
        } else {
            console.error(error);
            redirect('/500');
        }
    }

    revalidatePath('/', 'layout');
    redirect('/dashboard/user');
}

function generateErrorGeneric(): ErrorInterface {
    return { message: `Email or password is invalid. Please try again.` }
}