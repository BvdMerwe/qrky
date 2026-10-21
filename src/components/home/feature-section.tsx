import { LuBolt, LuChartBar, LuGift, LuHeart, LuLink2, LuLock, LuQrCode, LuSparkles } from 'react-icons/lu';

export default function FeatureSection() {
    return (
        <section className="py-20 bg-base-100">
            <div className="container mx-auto px-4">
                <div className="flex gap-4 flex-col items-center justify-center text-center mb-16">
                    <div className="badge badge-primary badge-soft badge-lg text-primary-content font-bold"><LuHeart/> Why makers love QRky</div>
                    <h2 className="text-4xl font-bold">Everything you need, nothing you don&#39;t</h2>
                    <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
                        Create it, share it, and see exactly how it performs. All in one bubbly little dashboard.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    <div className="card bg-base-200 border-2 border-base-300 md:col-span-2">
                        <div className="card-body items-start">
                            <div className="bg-primary/10 p-4 rounded-full mb-4">
                                <LuQrCode className="w-8 h-8 text-primary-content-content"/>
                            </div>
                            <h3 className="card-title text-2xl">QR codes in your colours</h3>
                            <p className="text-base-content/70">
                                Rounded modules, custom palettes and your logo right in the middle. Export print-ready in a click.
                            </p>
                            <div className="flex gap-2">
                                <div className="rounded-xl text-3xl bg-primary p-3">
                                    <LuQrCode className="text-primary-content" />
                                </div>
                                <div className="rounded-xl text-3xl bg-secondary p-3">
                                    <LuQrCode className="text-secondary-content" />
                                </div>
                                <div className="rounded-xl text-3xl bg-accent p-3">
                                    <LuQrCode className="text-accent-content" />
                                </div>
                                <div className="rounded-xl text-3xl bg-base-300 p-3">
                                    <LuQrCode className="text-base-300-content" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card bg-base-200 border-2 border-base-300">
                        <div className="card-body items-start">
                            <div className="bg-secondary/10 p-4 rounded-full mb-4">
                                <LuLink2 className="w-8 h-8 text-secondary-content"/>
                            </div>
                            <h3 className="card-title text-2xl">Smart URL Shortening</h3>
                            <p className="text-base-content/70">
                                Create memorable short links with custom identifiers.
                                Multiple URL patterns for maximum flexibility.
                            </p>
                        </div>
                    </div>

                    <div className="card bg-base-200 border-2 border-base-300">
                        <div className="card-body items-start">
                            <div className="bg-accent/10 p-4 rounded-full mb-4">
                                <LuChartBar className="w-8 h-8 text-accent-content"/>
                            </div>
                            <h3 className="card-title text-2xl">Powerful Analytics</h3>
                            <p className="text-base-content/70">
                                Track every scan and click. View detailed analytics including location,
                                device type, and time-based insights.
                            </p>
                        </div>
                    </div>

                    <div className="card bg-base-200 border-2 border-base-300">
                        <div className="card-body items-start">
                            <div className="bg-success/10 p-4 rounded-full mb-4">
                                <LuBolt className="w-8 h-8 text-success-content"/>
                            </div>
                            <h3 className="card-title text-2xl">Lightning Fast</h3>
                            <p className="text-base-content/70">
                                Built on the latest technology for instant redirects.
                                Your users won&apos;t wait.
                            </p>
                        </div>
                    </div>

                    <div className="card bg-base-200 border-2 border-base-300">
                        <div className="card-body items-start">
                            <div className="bg-warning/10 p-4 rounded-full mb-4">
                                <LuLock className="w-8 h-8 text-warning-content"/>
                            </div>
                            <h3 className="card-title text-2xl">Secure & Private</h3>
                            <p className="text-base-content/70">
                                Enterprise-grade security with Supabase Auth.
                                Your data is encrypted and protected.
                            </p>
                        </div>
                    </div>

                    <div className="card bg-base-200 border-2 border-base-300">
                        <div className="card-body items-start">
                            <div className="bg-accent/10 p-4 rounded-full mb-4">
                                <LuGift className="w-8 h-8 text-accent-content"/>
                            </div>
                            <h3 className="card-title text-2xl">Free to start</h3>
                            <p className="text-base-content/70">
                                Unlimited scans on every plan, including the one that costs nothing.
                            </p>
                            <p className="text-base-content/70 flex items-center justify-center gap-2">
                                <span className="text-3xl font-bold font-title">$0</span> forever*
                            </p>
                            <p className="w-full text-xs text-base-content/30 text-right">*for early adopters</p>
                        </div>
                    </div>

                    <div className="card bg-base-200 border-2 border-base-300 md:col-span-2">
                        <div className="card-body items-start">
                            <div className="bg-primary/10 p-4 rounded-full mb-4">
                                <LuSparkles className="w-8 h-8 text-primary-content"/>
                            </div>
                            <h3 className="card-title text-2xl">A dashboard you&#39;ll actually open</h3>
                            <p className="text-base-content/70">
                                Every code and link in one warm, tidy place. Sortable, searchable and quietly delightful.
                            </p>
                            <div className="box-border w-full h-[96px] shrink-0 flex flex-row gap-[12px] p-[8px_0px_0px_0px] justify-start items-end">
                                <div className="box-border [flex:1_1_0] h-[38px] bg-primary/40 hover:bg-primary transition-colors rounded-[10px_10px_4px_4px]"></div>
                                <div className="box-border [flex:1_1_0] h-[56px] bg-primary/40 hover:bg-primary transition-colors rounded-[10px_10px_4px_4px]"></div>
                                <div className="box-border [flex:1_1_0] h-[44px] bg-primary/40 hover:bg-primary transition-colors rounded-[10px_10px_4px_4px]"></div>
                                <div className="box-border [flex:1_1_0] h-[72px] bg-primary/40 hover:bg-primary transition-colors rounded-[10px_10px_4px_4px]"></div>
                                <div className="box-border [flex:1_1_0] h-[60px] bg-primary/40 hover:bg-primary transition-colors rounded-[10px_10px_4px_4px]"></div>
                                <div className="box-border [flex:1_1_0] h-[88px] bg-primary/40 hover:bg-primary transition-colors rounded-[10px_10px_4px_4px]"></div>
                                <div className="box-border [flex:1_1_0] h-[96px] bg-primary/40 hover:bg-primary transition-colors rounded-[10px_10px_4px_4px]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}