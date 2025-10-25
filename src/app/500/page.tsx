import Link from "next/link";

export default function ErrorPage() {
    const supportEmail = process.env.APP_EMAIL_SUPPORT ?? "support@example.com";
    return (
        <div className="prose flex flex-col w-full h-screen justify-center container mx-auto">
            <h1>Something went wrong</h1>
            <p className="p">An unexpected error has occurred. Our developers have been notified. If the error keeps happening, please reach out to <a href={"mailto:" + supportEmail} className="underline">Support</a>.</p>
            <Link href="/" className="btn">Return Home</Link>
        </div>
    )
}