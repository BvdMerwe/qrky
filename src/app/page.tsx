import Link from "next/link";
import {TbQrcode, TbLink, TbChartBar, TbSparkles, TbLock, TbBolt} from "react-icons/tb";
import Image from "next/image";
import {createClient} from "@/lib/supabase/server";

export default async function Home() {
    const supabase = await createClient();
    const { count: visitCount } = await supabase
        .from('visits')
        .select('*', {count: "planned", head: true});
    const { count: userCount } = await supabase
        .from('url_objects')
        .select('*', {count: "exact", head: true});
    const { count: urlCount } = await supabase
        .from('url_objects')
        .select('*', {count: "planned", head: true});

    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="hero min-h-[80vh] bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10">
                <div className="hero-content text-center flex-col gap-8 max-w-5xl">
                    <Image
                        src="/qrky-logotype.svg"
                        alt="QRky Logo"
                        width={458.5}
                        height={250}
                        className=""
                    />
                    <div className="prose lg:prose-xl">
                        <h1 className="text-5xl lg:text-7xl font-bold mb-4">
                            Beautiful QR Codes.
                            <br />
                            <span className="rainbow text-transparent">
                                Smarter Links.
                            </span>
                        </h1>
                        <p className="text-xl lg:text-2xl text-base-content/70 max-w-2xl mx-auto">
                            Generate custom-styled QR codes with embedded logos.
                            Shorten URLs and track every scan with powerful analytics.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mb-4">
                        <Link href="/register" className="btn btn-primary btn-lg flex-1">
                            <TbSparkles className="w-5 h-5" />
                            Get Started Free
                        </Link>
                        <Link href="/login" className="btn btn-outline btn-lg flex-1">
                            Login
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-base-200">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Why Choose QRky?</h2>
                        <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
                            Everything you need to create, manage, and track your QR codes and short links.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Feature 1 */}
                        <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="card-body items-center text-center">
                                <div className="bg-primary/10 p-4 rounded-full mb-4">
                                    <TbQrcode className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="card-title text-2xl">Custom Styled QR Codes</h3>
                                <p className="text-base-content/70">
                                    Generate beautiful QR codes with rounded corners, custom colors, and embedded logos. 
                                    Stand out from the crowd.
                                </p>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="card-body items-center text-center">
                                <div className="bg-secondary/10 p-4 rounded-full mb-4">
                                    <TbLink className="w-8 h-8 text-secondary" />
                                </div>
                                <h3 className="card-title text-2xl">Smart URL Shortening</h3>
                                <p className="text-base-content/70">
                                    Create memorable short links with custom identifiers. 
                                    Multiple URL patterns for maximum flexibility.
                                </p>
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="card-body items-center text-center">
                                <div className="bg-accent/10 p-4 rounded-full mb-4">
                                    <TbChartBar className="w-8 h-8 text-accent" />
                                </div>
                                <h3 className="card-title text-2xl">Powerful Analytics</h3>
                                <p className="text-base-content/70">
                                    Track every scan and click. View detailed analytics including location, 
                                    device type, and time-based insights.
                                </p>
                            </div>
                        </div>

                        {/* Feature 4 */}
                        <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="card-body items-center text-center">
                                <div className="bg-success/10 p-4 rounded-full mb-4">
                                    <TbBolt className="w-8 h-8 text-success" />
                                </div>
                                <h3 className="card-title text-2xl">Lightning Fast</h3>
                                <p className="text-base-content/70">
                                    Built on the latest technology for instant redirects.
                                    Your users won&apos;t wait.
                                </p>
                            </div>
                        </div>

                        {/* Feature 5 */}
                        <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="card-body items-center text-center">
                                <div className="bg-warning/10 p-4 rounded-full mb-4">
                                    <TbLock className="w-8 h-8 text-warning" />
                                </div>
                                <h3 className="card-title text-2xl">Secure & Private</h3>
                                <p className="text-base-content/70">
                                    Enterprise-grade security with Supabase Auth. 
                                    Your data is encrypted and protected.
                                </p>
                            </div>
                        </div>

                        {/* Feature 6 */}
                        <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="card-body items-center text-center">
                                <div className="bg-info/10 p-4 rounded-full mb-4">
                                    <TbSparkles className="w-8 h-8 text-info" />
                                </div>
                                <h3 className="card-title text-2xl">Beautiful Dashboard</h3>
                                <p className="text-base-content/70">
                                    Manage all your QR codes and links from a modern, intuitive dashboard. 
                                    Easy to use, powerful features.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-br from-primary to-secondary text-primary-content">
                <div className="container mx-auto px-4 text-center">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                            Ready to Get Started?
                        </h2>
                        <p className="text-xl mb-8 opacity-90">
                            Join thousands of users creating beautiful, trackable QR codes and short links.
                        </p>
                        <Link href="/register" className="btn btn-lg bg-base-100 text-primary hover:bg-base-200 border-none">
                            <TbSparkles className="w-6 h-6" />
                            Create Your Free Account
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-base-100">
                <div className="container mx-auto px-4">
                    <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
                        <div className="stat place-items-center">
                            <div className="stat-title">URLs Shortened</div>
                            <div className="stat-value text-primary">{ urlCount }</div>
                            <div className="stat-desc">And counting</div>
                        </div>
                        <div className="stat place-items-center">
                            <div className="stat-title">Total Visits</div>
                            <div className="stat-value text-secondary">{ visitCount }</div>
                            <div className="stat-desc">Across all URLs</div>
                        </div>
                        <div className="stat place-items-center">
                            <div className="stat-title">Active Users</div>
                            <div className="stat-value text-accent">{ userCount }</div>
                            <div className="stat-desc">Worldwide</div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
