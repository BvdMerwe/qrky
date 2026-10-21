import Link from 'next/link';
import { TbSparkles } from 'react-icons/tb';
import StatsSection from '@/components/home/stats-section';
import HeroSection from '@/components/home/hero-section';
import NavbarHome from '@/components/home/navbar-home';
import FeatureSection from '@/components/home/feature-section';

export default function Home() {

    return (<>
        <NavbarHome/>
        <div className="flex flex-col">
            <HeroSection/>

            <StatsSection/>

            <FeatureSection/>

            {/* CTA Section */}
            <section className="py-20 bg-linear-to-br from-base-300 to-base-200 text-primary-content">
                <div className="container mx-auto px-4 text-center">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                            Ready to Get Started?
                        </h2>
                        <p className="text-xl mb-8 opacity-90">
                            Join thousands of users creating beautiful, trackable QR codes and short links.
                        </p>
                        <span className="aura rainbow">
                            <Link href="/register" className="btn btn-lg btn-primary">
                                <TbSparkles className="w-6 h-6"/>
                                Create Your Free Account
                            </Link>
                        </span>
                    </div>
                </div>
            </section>
        </div>
    </>);
}
