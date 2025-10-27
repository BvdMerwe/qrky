import {createClient} from "@/lib/supabase/server";
import {redirect} from "next/navigation";
import Link from "next/link";
import {FaGithub, FaGoogle} from "react-icons/fa6";
import FormRegisterComponent from "@/components/auth/form-register";

export default async function RegisterPage() {
    const supabase = await createClient()
    const {data} = await supabase.auth.getUser();

    if (data?.user) {
        redirect("/dashboard/user");
    }

    return (
        <div className="flex flex-col gap-4 rounded-box bg-base-200 p-6 max-w-md mx-auto my-20">
            <h1 className="text-3xl font-bold self-center">Register to get QRky</h1>

            <span className="self-center">
                Already have an account?{" "}
                <Link href="/login" className="link link-secondary">Log in</Link>
            </span>

            <a className="btn btn-neutral">
                <FaGoogle />
                Register with Google
            </a>

            <a className="btn btn-neutral">
                <FaGithub />
                Register with Github
            </a>

            <div className="divider">OR</div>

            <FormRegisterComponent />

        </div>
    )
}