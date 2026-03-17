import Link from "next/link";

export default function FooterComponent(){
    return (
        <footer className="footer footer-horizontal footer-center bg-base-200 text-base-content rounded p-5">
            <aside>
                <p>Copyright © {new Date().getFullYear()}, <span className="rainbow font-sans">QRky</span> - All right reserved.</p>
                <div className="flex gap-4 mt-2">
                    <Link href="/terms" className="link link-hover">Terms</Link>
                    <Link href="/privacy" className="link link-hover">Privacy</Link>
                </div>
            </aside>
        </footer>
    );
}