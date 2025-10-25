import Link from "next/link";

export default function NotFound() {
    return (
        <div className="prose flex flex-col w-full h-screen justify-center container mx-auto">
            <h1>Not Found</h1>
            <p>Could not find requested resource.</p>
            <Link href="/" className="btn">Return Home</Link>
        </div>
    )
}