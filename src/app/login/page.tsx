import {createClient} from "@/lib/supabase/server";
import {redirect} from "next/navigation";
import Link from "next/link";
import {FaGithub, FaGoogle} from "react-icons/fa6";
import FormLoginComponent from "@/components/auth/form-login";

export default async function LoginPage() {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser();

    if (data?.user) {
        redirect("/dashboard/user");
    }

    return (
        <div className="flex flex-col gap-4 rounded-box bg-base-200 p-6 max-w-md mx-auto mt-20">
            <h1 className="text-3xl font-bold self-center">Log in and get QRky</h1>

            <span className="self-center">
                Don&#39;t have an account?{" "}
                <Link href="/register" className="link link-secondary">Register</Link>
            </span>

            <a className="btn btn-neutral">
                <FaGoogle />
                Log in with Google
            </a>

            <a className="btn btn-neutral">
                <FaGithub />
                Log in with Github
            </a>

            <div className="divider">OR</div>

            <FormLoginComponent />

            <a className="link link-accent">Forgot password?</a>
        </div>
    )
}