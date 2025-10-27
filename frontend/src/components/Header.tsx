import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
    const navigate = useNavigate();

    return (
        <header className="w-full bg-white border-b border-gray-100">
            <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
                {/* Logo - clickable to go to landing page */}
                <div
                    onClick={() => navigate("/")}
                    className="cursor-pointer flex items-center h-12 overflow-hidden transition-opacity hover:opacity-80"
                >
                    <img
                        src="/FareShare_Logo.png"
                        alt="FareShare Logo"
                        className="h-18"
                    />
                </div>

                {/* Navigation buttons */}
                <div className="flex gap-3 items-center">
                    <button
                        className="px-5 py-2.5 rounded-lg text-gray-700 font-medium hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
                        onClick={() => navigate("/rides")}
                    >
                        Ride Post & Request
                    </button>
                    <button
                        className="px-6 py-2.5 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 active:bg-orange-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        onClick={() => navigate("/signin")}
                    >
                        Login / Sign Up
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
