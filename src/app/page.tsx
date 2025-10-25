import Link from "next/link";

export default function Home() {
    return (
        <div className="py-4 flex flex-col container mx-auto">
            <div className="prose flex flex-col w-full h-96 justify-center mx-auto">
                <h1>A new way to generate shortened URLs and link custom QR codes to them.</h1>
                <p>QRky.app is here for you.</p>
            </div>
            <div className="flex flex-col gap-4 max-w-lg mx-auto w-full">
                <Link href="/login" className="btn btn-primary">Login</Link>
                <div className="divider">OR</div>
                <Link href="/register" className="btn btn-link">Register</Link>
            </div>
        </div>
    );
}
