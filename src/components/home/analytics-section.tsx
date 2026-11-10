import { LuActivity, LuArrowUpRight, LuFileDown, LuLock, LuMapPin, LuSmartphone, LuTimer } from 'react-icons/lu';

export default function AnalyticsSection() {
    return (
    <div
        className="w-full h-fit shrink-0 flex flex-col gap-0 justify-start items-start bg-[#262629] overflow-hidden relative"
    >
        <div
            className="w-[540px] h-[540px] [filter:blur(30px)] absolute left-[-160px] top-[-120px] bg-primary/33 rounded-[50%] [z-index:0]"
        ></div>
        <div
            className="container mx-auto flex flex-col-reverse md:flex-row gap-[64px] py-20 px-4 justify-start items-center relative [z-index:1]"
        >
            <div
                className="w-full md:w-1/2 shrink-0 h-fit [box-shadow:0px_18px_44px_#00000055] flex flex-col gap-0 justify-start items-start bg-base-100 rounded-[16px] overflow-hidden"
            >
                <div
                    className="w-full h-fit shrink-0 flex flex-row gap-[10px] p-[14px_20px] justify-start items-center bg-base-200"
                >
                    <div
                        className="w-[12px] shrink-0 h-[12px] bg-[#fe1c55] rounded-[50%]"
                    ></div>
                    <div
                        className="w-[12px] shrink-0 h-[12px] bg-[#eeaf00] rounded-[50%]"
                    ></div>
                    <div
                        className="w-[12px] shrink-0 h-[12px] bg-[#00ba7b] rounded-[50%]"
                    ></div>
                    <div
                        className="[flex:1_1_0] h-fit flex flex-row gap-[8px] p-[6px_14px] justify-start items-center bg-base-100 rounded-full"
                    >
                        <LuLock className="text-base-content" />
                        <div
                            className="h-3 w-full text-base-content font-normal text-left [white-space:nowrap]"
                        >
                            <div className="w-8/12 h-3 rounded-full bg-base-content/30"></div>
                        </div>
                    </div>
                </div>
                <div
                    className="w-full h-fit shrink-0 flex flex-col gap-[24px] p-[28px] justify-start items-start bg-base-100"
                >
                    <div
                        className="w-full h-fit shrink-0 flex flex-row gap-0 justify-between items-center"
                    >
                        <div
                            className="w-fit shrink-0 h-fit flex flex-col gap-[4px] justify-start items-start"
                        >
                            <div
                                className="text-[22px]/[normal] text-base-content font-title font-semibold text-left [white-space:nowrap]"
                            >
                                Scans this week
                            </div>
                            <div
                                className="text-[14px]/[normal] text-base-content/70 font-normal text-left [white-space:nowrap]"
                            >
                                your.product.io/launch
                            </div>
                        </div>
                        <div
                            className="w-fit shrink-0 h-fit flex flex-row gap-[6px] p-[6px_14px] justify-start items-center bg-primary/70 rounded-full"
                        >
                            <LuArrowUpRight className="text-primary-content"/>
                            <div
                                className="text-[14px]/[normal] text-primary-content font-bold text-left [white-space:nowrap]"
                            >
                                +18.4%
                            </div>
                        </div>
                    </div>
                    <div
                        className="w-full h-[206px] shrink-0 flex flex-row gap-[14px] justify-start items-end"
                    >
                        <div
                            className="[flex:1_1_0] h-full flex flex-col gap-[10px] justify-end items-center"
                        >
                            <div
                                className="w-full h-[84px] shrink-0 bg-primary rounded-[12px_12px_5px_5px]"
                            ></div>
                            <div
                                className="text-[13px]/[normal] text-base-content/70 font-semibold text-left [white-space:nowrap]"
                            >
                                Mon
                            </div>
                        </div>
                        <div
                            className="[flex:1_1_0] h-full flex flex-col gap-[10px] justify-end items-center"
                        >
                            <div
                                className="w-full h-[118px] shrink-0 bg-primary rounded-[12px_12px_5px_5px]"
                            ></div>
                            <div
                                className="text-[13px]/[normal] text-base-content/70 font-semibold text-left [white-space:nowrap]"
                            >
                                Tue
                            </div>
                        </div>
                        <div
                            className="[flex:1_1_0] h-full flex flex-col gap-[10px] justify-end items-center"
                        >
                            <div
                                className="w-full h-[96px] shrink-0 bg-primary rounded-[12px_12px_5px_5px]"
                            ></div>
                            <div
                                className="text-[13px]/[normal] text-base-content/70 font-semibold text-left [white-space:nowrap]"
                            >
                                Wed
                            </div>
                        </div>
                        <div
                            className="[flex:1_1_0] h-full flex flex-col gap-[10px] justify-end items-center"
                        >
                            <div
                                className="w-full h-[142px] shrink-0 bg-primary rounded-[12px_12px_5px_5px]"
                            ></div>
                            <div
                                className="text-[13px]/[normal] text-base-content/70 font-semibold text-left [white-space:nowrap]"
                            >
                                Thu
                            </div>
                        </div>
                        <div
                            className="[flex:1_1_0] h-full flex flex-col gap-[10px] justify-end items-center"
                        >
                            <div
                                className="w-full h-[110px] shrink-0 bg-primary rounded-[12px_12px_5px_5px]"
                            ></div>
                            <div
                                className="text-[13px]/[normal] text-base-content/70 font-semibold text-left [white-space:nowrap]"
                            >
                                Fri
                            </div>
                        </div>
                        <div
                            className="[flex:1_1_0] h-full flex flex-col gap-[10px] justify-end items-center"
                        >
                            <div
                                className="w-full h-[164px] shrink-0 bg-primary rounded-[12px_12px_5px_5px]"
                            ></div>
                            <div
                                className="text-[13px]/[normal] text-base-content/70 font-semibold text-left [white-space:nowrap]"
                            >
                                Sat
                            </div>
                        </div>
                        <div
                            className="[flex:1_1_0] h-full flex flex-col gap-[10px] justify-end items-center"
                        >
                            <div
                                className="w-full h-[132px] shrink-0 bg-primary rounded-[12px_12px_5px_5px]"
                            ></div>
                            <div
                                className="text-[13px]/[normal] text-base-content/70 font-semibold text-left [white-space:nowrap]"
                            >
                                Sun
                            </div>
                        </div>
                    </div>
                    <div
                        className="w-full h-fit shrink-0 flex flex-col xl:flex-row gap-[20px] p-[4px_0px_0px_0px] justify-start items-start"
                    >
                        <div
                            className="[flex:1_1_0] w-full h-fit flex flex-row gap-[16px] p-[20px] justify-start items-center bg-base-200 rounded-[16px]"
                        >
                            <div
                                className="w-[92px] shrink-0 h-[92px] relative"
                            >
                                <div
                                    className="w-[92px] h-[92px] absolute left-0 top-0 bg-base-100 [clip-path:path('M46_0_C71.405_0_92_20.595_92_46_C92_71.405_71.405_92_46_92_C20.595_92_0_71.405_0_46_C0_20.595_20.595_0_46_0_Z_M46_17.48_C30.249_17.48_17.48_30.249_17.48_46_C17.48_61.751_30.249_74.52_46_74.52_C61.751_74.52_74.52_61.751_74.52_46_C74.52_30.249_61.751_17.48_46_17.48_Z')] [z-index:0]"
                                ></div>
                                <div
                                    className="w-[92px] h-[92px] absolute left-0 top-0 bg-primary [clip-path:path('M46_0_C71.405_0_92_20.595_92_46_C92_71.405_71.405_92_46_92_C31.84_92_18.469_85.479_9.752_74.32_L23.526_63.559_C28.931_70.477_37.221_74.52_46_74.52_C61.751_74.52_74.52_61.751_74.52_46_C74.52_30.249_61.751_17.48_46_17.48_L46_0_Z')] [z-index:1]"
                                ></div>
                                <div
                                    className="w-[92px] h-[92px] absolute left-0 top-0 bg-accent [clip-path:path('M9.752_74.32_C3.433_66.233_0_56.264_0_46_C0_32.963_5.532_20.539_15.22_11.815_L26.916_24.806_C20.91_30.214_17.48_37.917_17.48_46_C17.48_52.363_19.608_58.544_23.526_63.559_L9.752_74.32_Z')] [z-index:2]"
                                ></div>
                            </div>
                            <div
                                className="[flex:1_1_0] h-fit flex flex-col gap-[10px] justify-start items-start"
                            >
                                <div
                                    className="w-full h-fit shrink-0 flex flex-row gap-[8px] justify-start items-center"
                                >
                                    <div
                                        className="w-[11px] shrink-0 h-[11px] bg-primary rounded-[50%]"
                                    ></div>
                                    <div
                                        className="text-[14px]/[normal] [flex:1_1_0] text-base-content font-normal text-left"
                                    >
                                        Mobile
                                    </div>
                                    <div
                                        className="text-[14px]/[normal] text-base-content font-bold text-left [white-space:nowrap]"
                                    >
                                        64%
                                    </div>
                                </div>
                                <div
                                    className="w-full h-fit shrink-0 flex flex-row gap-[8px] justify-start items-center"
                                >
                                    <div
                                        className="w-[11px] shrink-0 h-[11px] bg-accent rounded-[50%]"
                                    ></div>
                                    <div
                                        className="text-[14px]/[normal] [flex:1_1_0] text-base-content font-normal text-left"
                                    >
                                        Desktop
                                    </div>
                                    <div
                                        className="text-[14px]/[normal] text-base-content font-bold text-left [white-space:nowrap]"
                                    >
                                        24%
                                    </div>
                                </div>
                                <div
                                    className="w-full h-fit shrink-0 flex flex-row gap-[8px] justify-start items-center"
                                >
                                    <div
                                        className="w-[11px] shrink-0 h-[11px] bg-base-100 rounded-[50%]"
                                    ></div>
                                    <div
                                        className="text-[14px]/[normal] [flex:1_1_0] text-base-content font-normal text-left"
                                    >
                                        Tablet
                                    </div>
                                    <div
                                        className="text-[14px]/[normal] text-base-content font-bold text-left [white-space:nowrap]"
                                    >
                                        12%
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div
                            className="[flex:1_1_0] w-full h-fit flex flex-col gap-[12px] p-[20px] justify-start items-start bg-base-200 rounded-[16px]"
                        >
                            <div
                                className="text-[12px]/[normal] text-base-content/70 font-bold tracking-[0.8px] text-left [white-space:nowrap]"
                            >
                                TOP LOCATIONS
                            </div>
                            <div
                                className="w-full h-fit shrink-0 flex flex-col gap-[6px] justify-start items-start"
                            >
                                <div
                                    className="w-full h-fit shrink-0 flex flex-row gap-0 justify-between items-start"
                                >
                                    <div
                                        className="text-[14px]/[normal] text-base-content font-semibold text-left [white-space:nowrap]"
                                    >
                                        Cape Town
                                    </div>
                                    <div
                                        className="text-[14px]/[normal] text-base-content/70 font-normal text-left [white-space:nowrap]"
                                    >
                                        2,104
                                    </div>
                                </div>
                                <div
                                    className="w-full h-[8px] shrink-0 flex flex-row gap-0 justify-start items-start bg-base-100 rounded-full"
                                >
                                    <div
                                        className="w-7/8 shrink-0 h-[8px] bg-accent rounded-full"
                                    ></div>
                                </div>
                            </div>
                            <div
                                className="w-full h-fit shrink-0 flex flex-col gap-[6px] justify-start items-start"
                            >
                                <div
                                    className="w-full h-fit shrink-0 flex flex-row gap-0 justify-between items-start"
                                >
                                    <div
                                        className="text-[14px]/[normal] text-base-content font-semibold text-left [white-space:nowrap]"
                                    >
                                        Berlin
                                    </div>
                                    <div
                                        className="text-[14px]/[normal] text-base-content/70 font-normal text-left [white-space:nowrap]"
                                    >
                                        1,388
                                    </div>
                                </div>
                                <div
                                    className="w-full h-[8px] shrink-0 flex flex-row gap-0 justify-start items-start bg-base-100 rounded-full"
                                >
                                    <div
                                        className="w-4/8 shrink-0 h-[8px] bg-accent rounded-full"
                                    ></div>
                                </div>
                            </div>
                            <div
                                className="w-full h-fit shrink-0 flex flex-col gap-[6px] justify-start items-start"
                            >
                                <div
                                    className="w-full h-fit shrink-0 flex flex-row gap-0 justify-between items-start"
                                >
                                    <div
                                        className="text-[14px]/[normal] text-base-content font-semibold text-left [white-space:nowrap]"
                                    >
                                        Lisbon
                                    </div>
                                    <div
                                        className="text-[14px]/[normal] text-base-content/70 font-normal text-left [white-space:nowrap]"
                                    >
                                        902
                                    </div>
                                </div>
                                <div
                                    className="w-full h-[8px] shrink-0 flex flex-row gap-0 justify-start items-start bg-base-100 rounded-full"
                                >
                                    <div
                                        className="w-1/8 shrink-0 h-[8px] bg-accent rounded-full"
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div
                className="[flex:1_1_0] h-fit flex flex-col gap-[24px] justify-start items-start"
            >
                <div
                    className="w-fit h-fit shrink-0 flex flex-row gap-[8px] p-[8px_16px] justify-start items-center bg-[#e4e4e71f] rounded-full"
                >
                    <LuActivity className="text-accent"/>
                    <div
                        className="text-[14px]/[normal] text-[#e4e4e7] font-bold text-left [white-space:nowrap]"
                    >
                        Analytics that make sense
                    </div>
                </div>
                <div
                    className="text-[44px]/[50px] w-full text-[#e4e4e7] font-title font-semibold tracking-[-0.8px] text-left"
                >
                    Know exactly what your codes are doing
                </div>
                <div
                    className="text-[18px]/[29px] w-full text-[#e4e4e7c4] font-normal text-left"
                >
                    Every scan is logged the moment it happens. Where it came from, what device it was on
                    and what time of day people actually reach for their&nbsp;phones.
                </div>
                <div
                    className="w-full h-fit shrink-0 flex flex-col gap-[14px] justify-start items-start"
                >
                    <div
                        className="w-full h-fit shrink-0 flex flex-row gap-[12px] justify-start items-center"
                    >
                        <div
                            className="w-[32px] shrink-0 h-[32px] flex flex-row gap-0 justify-center items-center bg-[#e4e4e71f] rounded-full"
                        >
                            <LuMapPin  className="text-accent"/>
                        </div>
                        <div
                            className="text-[17px]/[normal] [flex:1_1_0] text-[#e4e4e7] font-normal text-left"
                        >
                            City-level location on every scan
                        </div>
                    </div>
                    <div
                        className="w-full h-fit shrink-0 flex flex-row gap-[12px] justify-start items-center"
                    >
                        <div
                            className="w-[32px] shrink-0 h-[32px] flex flex-row gap-0 justify-center items-center bg-[#e4e4e71f] rounded-full"
                        >
                            <LuSmartphone className="text-accent"/>
                        </div>
                        <div
                            className="text-[17px]/[normal] [flex:1_1_0] text-[#e4e4e7] font-normal text-left"
                        >
                            Device and browser breakdown
                        </div>
                    </div>
                    <div
                        className="w-full h-fit shrink-0 flex flex-row gap-[12px] justify-start items-center"
                    >
                        <div
                            className="w-[32px] shrink-0 h-[32px] flex flex-row gap-0 justify-center items-center bg-[#e4e4e71f] rounded-full"
                        >
                            <LuTimer className="text-accent"/>
                        </div>
                        <div
                            className="text-[17px]/[normal] [flex:1_1_0] text-[#e4e4e7] font-normal text-left"
                        >
                            Time-of-day and day-of-week trends
                        </div>
                    </div>
                    <div
                        className="w-full h-fit shrink-0 flex flex-row gap-[12px] justify-start items-center"
                    >
                        <div
                            className="w-[32px] shrink-0 h-[32px] flex flex-row gap-0 justify-center items-center bg-[#e4e4e71f] rounded-full"
                        >
                            <LuFileDown className="text-accent"/>
                        </div>
                        <div
                            className="text-[17px]/[normal] [flex:1_1_0] text-[#e4e4e7] font-normal text-left"
                        >
                            Export anything to CSV
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);
}