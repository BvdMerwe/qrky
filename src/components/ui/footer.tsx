"use client"

export default function FooterComponent(){
    return (
        <footer className="footer footer-horizontal footer-center bg-base-200 text-base-content rounded p-5">
            <aside>
                <p>Copyright © {new Date().getFullYear()}, <span className="rainbow font-sans">QRky</span> - All right reserved.</p>
            </aside>
        </footer>
    );
}