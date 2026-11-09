import StatsSection from '@/components/home/stats-section';
import HeroSection from '@/components/home/hero-section';
import NavbarHome from '@/components/home/navbar-home';
import FeatureSection from '@/components/home/feature-section';
import CtaSection from '@/components/home/cta-section';
import AnalyticsSection from '@/components/home/analytics-section';

export default function Home() {

    return (<>
        <NavbarHome/>
        <div className="flex flex-col">
            <HeroSection/>

            <StatsSection/>

            <FeatureSection/>

            <AnalyticsSection/>

            <CtaSection/>
        </div>
    </>);
}
