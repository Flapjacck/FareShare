import React, { useState, useEffect } from "react";

const texts = [
    {
        title: "Welcome to FareShare!",
        body: "We're a non-profit ride sharing platform focused on hosting a reliable, community-based ride sharing experience that connects drivers and passengers going to similar destinations.",
    },
    {
        title: "Flexible Scheduling!",
        body: "Pre-plan local trips or search for posted rides in real-time. FareShare makes ride sharing easy and hassle-free!",
    },
    {
        title: "A Ride Tailored To you!",
        body: "Our goal is to offer simple ride preference and accessibility options to allow you to filter for the perfect ride that suits your needs.",
    },
    {
        title: "A Safe & Trusted Community!",
        body: "We verify all our platform's users to ensure a high quality environment for everyone. With two-way driver and rider ratings and reviews, you can always rest assured you're travelling safely!",
    },
];

const LandingPage: React.FC = () => {
    const [index, setIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const changeSlide = (newIndex: number) => {
        setIsAnimating(true);
        setTimeout(() => {
            setIndex(newIndex);
            setIsAnimating(false);
        }, 300);
    };

    const prev = () => changeSlide((index - 1 + texts.length) % texts.length);
    const next = () => changeSlide((index + 1) % texts.length);

    // Auto-scroll through slides every 8 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            changeSlide((index + 1) % texts.length);
        }, 8000);

        return () => clearInterval(interval);
    }, [index]);

    return (
        <div className="flex flex-col bg-white text-slate-900 overflow-hidden" style={{ height: 'calc(100vh - 80px)' }}>
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 box-border">
                {/* Logo */}
                <div className="mb-10">
                    <img
                        src="/FareShare_Logo.png"
                        alt="FareShare Logo"
                        className="h-40 md:h-48 lg:h-56"
                    />
                </div>

                <div className="w-full max-w-[760px] p-6 box-border flex items-center justify-center relative">
                    <button
                        aria-label="Previous"
                        onClick={prev}
                        title="Previous"
                        className="absolute top-1/2 -translate-y-3/4 left-[-30px] w-11 h-11 text-xl rounded-[15px] border-none bg-slate-900/6 flex items-center justify-center cursor-pointer hover:bg-slate-900/10 transition-colors"
                    >
                        ◀
                    </button>

                    <div className="flex flex-col items-center justify-center w-full">
                        <div className="w-full bg-white rounded-xl shadow-[0_10px_30px_rgba(2,6,23,0.08)] py-10 px-12 box-border text-center min-h-[220px] flex flex-col items-center justify-center overflow-hidden">
                            <div
                                className={`transition-all duration-500 ease-in-out ${
                                    isAnimating 
                                        ? 'opacity-0 -translate-x-8' 
                                        : 'opacity-100 translate-x-0'
                                }`}
                                key={index}
                            >
                                <div className="text-3xl md:text-4xl font-bold mb-4">{texts[index].title}</div>
                                <div className="text-lg md:text-xl text-slate-700 leading-[1.6] max-w-[640px]">{texts[index].body}</div>
                            </div>
                        </div>

                        {/* indicator bubbles below the panel */}
                        <div className="flex gap-2.5 mt-3 justify-center items-center">
                            {texts.map((_, i) => (
                                <div
                                    key={i}
                                    role="button"
                                    aria-label={`Show slide ${i + 1}`}
                                    aria-current={i === index ? "true" : "false"}
                                    onClick={() => changeSlide(i)}
                                    className={`w-3.5 h-3.5 rounded-full border transition-[background,transform] duration-200 cursor-pointer ${
                                        i === index
                                            ? "bg-slate-900 border-black/5 scale-105"
                                            : "bg-white border-slate-300"
                                    }`}
                                />
                            ))}
                        </div>
                    </div>

                    <button
                        aria-label="Next"
                        onClick={next}
                        title="Next"
                        className="absolute top-1/2 -translate-y-3/4 right-[-30px] w-11 h-11 text-xl rounded-[15px] border-none bg-slate-900/6 flex items-center justify-center cursor-pointer hover:bg-slate-900/10 transition-colors"
                    >
                        ▶
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;