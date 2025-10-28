import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

    const changeSlide = (newIndex: number) => {
        setIndex(newIndex);
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
        <div className="flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 80px)', backgroundColor: 'var(--color-background-warm)' }}>
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 box-border">
                {/* Logo */}
                <motion.div 
                    className="mb-10"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                >
                    <img
                        src="/FareShare_Logo.png"
                        alt="FareShare Logo"
                        className="h-40 md:h-48 lg:h-56"
                    />
                </motion.div>

                <div className="w-full max-w-[760px] p-6 box-border flex items-center justify-center relative">
                    <motion.button
                        aria-label="Previous"
                        onClick={prev}
                        title="Previous"
                        className="absolute top-1/2 -translate-y-3/4 left-[-30px] w-11 h-11 text-xl rounded-[15px] border-none flex items-center justify-center cursor-pointer transition-colors"
                        style={{ 
                            backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)',
                            color: 'var(--color-primary)'
                        }}
                        whileHover={{ 
                            scale: 1.1,
                            backgroundColor: 'rgba(var(--color-primary-rgb), 0.2)'
                        }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <ChevronLeft size={24} />
                    </motion.button>

                    <div className="flex flex-col items-center justify-center w-full">
                        <motion.div 
                            className="w-full bg-white rounded-xl shadow-[0_10px_30px_rgba(252,74,26,0.12)] py-10 px-12 box-border text-center min-h-[220px] flex flex-col items-center justify-center overflow-hidden"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <div className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--color-primary)' }}>{texts[index].title}</div>
                                    <div className="text-lg md:text-xl leading-[1.6] max-w-[640px]" style={{ color: '#4a5568' }}>{texts[index].body}</div>
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>

                        {/* indicator bubbles below the panel */}
                        <div className="flex gap-2.5 mt-3 justify-center items-center">
                            {texts.map((_, i) => (
                                <motion.div
                                    key={i}
                                    role="button"
                                    aria-label={`Show slide ${i + 1}`}
                                    aria-current={i === index ? "true" : "false"}
                                    onClick={() => changeSlide(i)}
                                    className="w-3.5 h-3.5 rounded-full border cursor-pointer"
                                    style={{
                                        backgroundColor: i === index ? 'var(--color-primary)' : 'white',
                                        borderColor: i === index ? 'var(--color-primary)' : 'var(--color-secondary)'
                                    }}
                                    whileHover={{ scale: 1.2 }}
                                    animate={{ scale: i === index ? 1.15 : 1 }}
                                    transition={{ duration: 0.2 }}
                                />
                            ))}
                        </div>
                    </div>

                    <motion.button
                        aria-label="Next"
                        onClick={next}
                        title="Next"
                        className="absolute top-1/2 -translate-y-3/4 right-[-30px] w-11 h-11 text-xl rounded-[15px] border-none flex items-center justify-center cursor-pointer transition-colors"
                        style={{ 
                            backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)',
                            color: 'var(--color-primary)'
                        }}
                        whileHover={{ 
                            scale: 1.1,
                            backgroundColor: 'rgba(var(--color-primary-rgb), 0.2)'
                        }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <ChevronRight size={24} />
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;