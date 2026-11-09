import Link from 'next/link';
import { TbCheck, TbSparkles } from 'react-icons/tb';

export default function CtaSection() {
    return (
        <section className="relative overflow-hidden py-20 bg-linear-to-br from-base-300 to-base-200 text-primary-content">
            <div className="absolute inset-0 box-border w-full h-[516px] shrink-0 flex flex-col gap-0 justify-start items-start [background-image:linear-gradient(-109.714deg,_var(--color-accent)_14.645%,_var(--color-secondary)_85.355%)] bg-no-repeat bg-[length:100%_100%] overflow-hidden">
                <div className="box-border w-[300px] h-[300px] absolute left-[-70px] top-[-90px] bg-base-100/30 dark:bg-primary-content/10 rounded-[50%] [z-index:0]"></div>
                <div className="box-border w-[260px] h-[260px] absolute right-[30px] top-[300px] bg-base-100/30 dark:bg-primary-content/10 rounded-[50%] [z-index:1]"></div>
                <div className="box-border w-[120px] h-[120px] absolute left-[180px] top-[330px] bg-base-100/30 dark:bg-primary-content/10 rounded-[50%] [z-index:2]"></div>
                <div className="box-border w-[150px] h-[150px] absolute right-[40px] top-[-60px] bg-base-100/30 dark:bg-primary-content/10 rounded-[50%] [z-index:3]"></div>
            </div>

            <div className="container mx-auto px-4 text-center z-2 relative">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                        Ready to make your links a little more fun?
                    </h2>
                    <p className="text-xl mb-8 opacity-90">
                        Sign up, make your first code in ninety seconds.
                    </p>
                    <span className="aura rainbow">
                        <Link href="/register" className="btn btn-lg btn-primary">
                            <TbSparkles className="w-6 h-6"/>
                            Create Your Free Account
                        </Link>
                    </span>
                </div>
                <div className="flex mt-4 justify-center gap-2 items-center text-sm">
                    <TbCheck/> <span>No credit card · unlimited scans · cancel any time</span>
                </div>
            </div>
        </section>
    );
};