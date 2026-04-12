import Link from 'next/link';

export default function ErrorPage() {
    return (
        <div className="prose flex flex-col w-full h-screen justify-center container mx-auto">
            <h1>Verification Failed</h1>
            <p className="p">
                This verification link may be invalid or has expired. 
                Please request a new verification email to continue.
            </p>
            <Link href="/" className="btn">Return Home</Link>
        </div>
    );
}
