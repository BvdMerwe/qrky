import { LuCopy, LuLink, LuPartyPopper, LuScanLine, LuSparkles, LuTrendingUp, LuZap } from 'react-icons/lu';
import Title from '@/components/typography/title';
import Image from 'next/image';
import React from 'react';
import Link from 'next/link';

export default function HeroSection() {
    return (
        <div className="relative px-8 md:px-16 pb-24 pt-16 bg-base-100 overflow-hidden">
            <div className="absolute inset-0 w-full pointer-events-none">
                <div className="grid grid-cols-6 grid-rows-6 lg:grid-cols-12 h-[50vh] items-center align-middle">
                    <div className="w-130 h-130 row-start-2 col-start-2 self-center justify-self-center blur-2xl bg-primary/20 rounded-full"></div>
                    <div
                        className="w-55 h-55 row-start-6 col-start-6 mt-24 self-center justify-self-center blur-2xl bg-secondary/20 rounded-full"
                    ></div>
                    <div
                        className="w-96 h-96 row-start-5 col-start-12 self-center justify-self-center blur-2xl bg-accent/20 rounded-full"
                    ></div>
                </div>
            </div>
            <div className="relative z-1 flex md:flex-row flex-col align-middle justify-center gap-14">
                <div className="flex flex-col gap-7 md:max-w-1/2">
                    <div className="badge badge-lg badge-accent font-bold">
                        <LuPartyPopper/> <span>Free forever<span className="font-light">*</span> · no credit card</span>
                    </div>
                    <Title isLarge>
                        Scan-worthy QR codes,<br/>
                        <span className="text-primary-content dark:text-secondary-content">seriously smart links.</span>
                    </Title>
                    <p>Design QR codes in your colours with your logo baked in, shorten any URL, and watch every scan land in a dashboard that&#39;s actually fun to open.</p>
                    <div className="flex gap-3.5">
                        <div className="aura aura-holo">
                            <Link className="btn btn-primary" href="/register"><LuSparkles/>Get started free</Link>
                        </div>
                    </div>
                    <div className="flex gap-3.5 items-center w-full">
                        <div className="avatar-group -space-x-5">
                            <div className="avatar">
                                <div className="w-9 h-9 bg-primary text-primary-content font-title flex text-center font-bold flex-col justify-center">
                                    Q
                                </div>
                            </div>
                            <div className="avatar">
                                <div className="w-9 h-9 bg-secondary text-secondary-content font-title flex text-center font-bold flex-col justify-center">
                                    R
                                </div>
                            </div>
                            <div className="avatar">
                                <div className="w-9 h-9 bg-accent text-accent-content font-title flex text-center font-bold flex-col justify-center">
                                    k
                                </div>
                            </div>
                            <div className="avatar">
                                <div className="w-9 h-9 bg-base-300 text-base-content font-title flex text-center font-bold flex-col justify-center">
                                    y
                                </div>
                            </div>
                        </div>
                        <span className="text-base-content/70 leading-4 text-sm">Be one of the makers already&nbsp;scanning</span>
                    </div>
                </div>
                <div className="flex flex-col gap-14 md:max-w-1/2">
                    <div className="box-border w-full md:w-125 shrink-0 h-125 relative">
                        <div
                            className="box-border max-w-86 h-fit [box-shadow:0px_14px_34px_var(--color-base-200)] box-sh absolute md:left-15 left-0 top-11 flex flex-col gap-4 p-6 justify-start items-center bg-base-100 [outline:2px_solid] outline-base-200 -outline-offset-1 rounded-2xl z-1"
                        >
                            <div className="box-border w-full shrink-0 relative">
                                <Image
                                    src="/hero/hero-qr.png"
                                    alt="QR Code"
                                    width={300}
                                    height={300}
                                    className="rounded-2xl"
                                />
                            </div>
                            <div className="box-border w-full h-fit shrink-0 flex flex-row text-base-content gap-2.5 p-[10px_14px] justify-start items-center bg-base-200 rounded-[9999px]">
                                <LuLink/>
                                <div className="text-[16px]/[normal] box-border flex-[1_1_0]  font-bold text-left">
                                    qrky.app/register
                                </div>
                                <LuCopy/>
                            </div>
                            <div
                                className="box-border w-full h-fit shrink-0 flex flex-row gap-0 justify-between items-center"
                            >
                                <div className="badge badge-accent font-bold">
                                    <LuTrendingUp />
                                    1,284 scans
                                </div>
                                <div className="text-base-content/70 text-xs">
                                    last 7 days
                                </div>
                            </div>
                        </div>
                        <div
                            className="transform-[rotate(-8deg)] origin-[top_left] text-bold absolute md:left-82.5 -right-10 top-2 z-2"
                        >
                            <div className="badge badge-xl badge-secondary font-bold shadow-lg">
                                <LuZap className="text-secondary-content"/>
                                +312 today
                            </div>
                        </div>
                        <div
                            className="box-border w-16 h-16 transform-[rotate(10deg)] origin-[top_left] shadow-lg absolute md:left-2.5 -left-10 top-87.5 flex flex-row gap-0 justify-center items-center bg-primary rounded-full z-3"
                        >
                            <LuScanLine/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}