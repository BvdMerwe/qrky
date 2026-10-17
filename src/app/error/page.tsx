import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function ErrorPage({
    searchParams,
}: {
    searchParams: Promise<{ type?: string; user?: string }>
}) {
    const params = await searchParams;

    if (params.type === 'email_not_confirmed' && params.user) {
        redirect(`/email-verification-waiting?user=${params.user}`);
    }

    return (
        <div className="prose flex flex-col w-full h-screen justify-center container mx-auto">
            <h1>Something went wrong</h1>
            <p className="p">
                We encountered an unexpected error. Please try again or return home.
            </p>
            <Link href="/" className="btn">Return Home</Link>
        </div>
    );
}
