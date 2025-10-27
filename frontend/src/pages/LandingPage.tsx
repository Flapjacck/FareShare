import React, { useState } from "react";
import logoImg from "../FareShare_Logo.png"; // adjust path if needed

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

const pageLayout: React.CSSProperties = {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    fontFamily: "Nunito, sans-serif",
    background: "#ffffff",
    color: "#0f172a",
    padding: "24px",
    boxSizing: "border-box",
};

const navigationBarContainer: React.CSSProperties = {
    width: "100%",
    maxWidth: 1100,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    boxSizing: "border-box",
};

const navigationButtonGroup: React.CSSProperties = {
    display: "flex",
    gap: 12,
};

const navigationBarButtons: React.CSSProperties = {
    border: "1px solid rgba(15,23,42,0.08)",
    boxShadow: "0 10px 15px rgba(2,6,15,0.08)",
    padding: "8px 14px",
    borderRadius: 8,
    background: "white",
    cursor: "pointer",
    fontWeight: 600,
};

const mainLogo: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 8,
    flexDirection: "column",
};

const logoImage: React.CSSProperties = {
    display: "block",
    maxWidth: "100%",
    height: "auto",
};

const contentPanel: React.CSSProperties = {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
};

const contentPanelWrapper: React.CSSProperties = {
    width: "100%",
    maxWidth: 760,
    padding: 24,
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
};

const contentColumnLayout: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
};

const contentTextCard: React.CSSProperties = {
    width: "100%",
    background: "white",
    borderRadius: 12,
    boxShadow: "0 10px 30px rgba(2,6,23,0.08)",
    padding: "28px 48px",
    boxSizing: "border-box",
    textAlign: "center",
    minHeight: 160,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 300ms ease, opacity 300ms ease",
};

const carouselDots: React.CSSProperties = {
    display: "flex",
    gap: 10,
    marginTop: 12,
    justifyContent: "center",
    alignItems: "center",
};

const dotStyle: React.CSSProperties = {
    width: 14,
    height: 14,
    borderRadius: "50%",
    background: "white",
    border: "1px solid #cbd5e1",
    transition: "background 200ms, transform 200ms",
    cursor: "pointer",
};

const selectedDotStyle: React.CSSProperties = {
    background: "#0f172a",
    border: "1px solid rgba(0,0,0,0.05)",
    transform: "scale(1.05)",
};

const arrowButtonBaseStyle: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-75%)",
    width: 44,
    height: 44,
    fontSize: 20, //triangle size
    borderRadius: 15,
    border: "none",
    background: "rgba(15,23,42,0.06)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
};

const leftArrow: React.CSSProperties = {
    ...arrowButtonBaseStyle,
    left: -30,
};

const rightArrow: React.CSSProperties = {
    ...arrowButtonBaseStyle,
    right: -30,
};

const getStartedButton: React.CSSProperties = {
    marginTop: 28,
    marginBottom: 8,
    width: 220,
    padding: "12px 18px",
    borderRadius: 700,
    border: "none",
    background: "linear-gradient(105deg,#E76D48,#FDD700)",
    color: "black",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 10px 30px rgba(2,6,23,0.08)",
};

const titleStyle: React.CSSProperties = {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 8,
};

const bodyStyle: React.CSSProperties = {
    fontSize: 15,
    color: "#334155",
    lineHeight: 1.4,
    maxWidth: 540,
};

const bottomPageMargin: React.CSSProperties = {
    height: 24,
};

const LandingPage: React.FC = () => {
    const [index, setIndex] = useState(0);

    const prev = () => setIndex((i) => (i - 1 + texts.length) % texts.length);
    const next = () => setIndex((i) => (i + 1) % texts.length);

    return (
        <div style={pageLayout}>
            <nav style={navigationBarContainer}>
                <div style={{ ...navigationButtonGroup }}>
                    <button
                        style={{ ...navigationBarButtons }}
                        onClick={() => {
                            // to be implemented to redirect to register page
                            console.log("Register clicked");
                        }}
                    >
                        Register
                    </button>
                    <button
                        style={{ ...navigationBarButtons }}
                        onClick={() => {
                            console.log("Login clicked");
                        }}
                    >
                        Login
                    </button>
                </div>
            </nav>

            <div style={mainLogo}>
                <img src={logoImg} alt="FareShare logo" style={logoImage} />
            </div>

            <div style={contentPanel}>
                <div style={contentPanelWrapper}>
                    <button
                        aria-label="Previous"
                        onClick={prev}
                        style={leftArrow}
                        title="Previous"
                    >
                        ◀
                    </button>

                    <div style={contentColumnLayout}>
                        <div style={contentTextCard}>
                            <div
                                style={{
                                    opacity: 1,
                                    transform: "translateY(0)",
                                    transition: "opacity 300ms, transform 300ms",
                                }}
                                key={index}
                            >
                                <div style={titleStyle}>{texts[index].title}</div>
                                <div style={bodyStyle}>{texts[index].body}</div>
                            </div>
                        </div>

                        {/* indicator bubbles below the panel */}
                        <div style={carouselDots}>
                            {texts.map((_, i) => (
                                <div
                                    key={i}
                                    role="button"
                                    aria-label={`Show slide ${i + 1}`}
                                    aria-current={i === index ? "true" : "false"}
                                    onClick={() => setIndex(i)}
                                    style={{
                                        ...dotStyle,
                                        ...(i === index ? selectedDotStyle : {}),
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <button
                        aria-label="Next"
                        onClick={next}
                        style={rightArrow}
                        title="Next"
                    >
                        ▶
                    </button>
                </div>
            </div>

            <div style={{ display: "flex", width: "100%", justifyContent: "center" }}>
                <button
                    style={getStartedButton}
                    onClick={() => {
                        console.log("Get started clicked");
                    }}
                >
                    Get Started
                </button>
            </div>

            <div style={bottomPageMargin} />
        </div>
    );
};

export default LandingPage;