import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Logo from "../components/Logo";

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  // --- Frontend validation only ---
  if (!email || !password) {
    setError("Please fill in all fields.");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    setError("Please enter a valid email address.");
    return;
  }

  // --- Mocked "login" ---
  if (email === "test@example.com" && password === "123456") {
    navigate("/dashboard");
  } else {
    setError("Invalid email or password.");
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-sm p-8  ">
        {/* Logo */}
        <Logo />

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-1 px-5 bg-gray-100 rounded-md border border-gray-300 drop-shadow-sm drop-shadow-black">
            {/* UserName input */}
            <div className="mb-1 border-b-2 border-gray-400 focus-within:border-black">
              <input
                type="text"
                placeholder="Username"
                className="w-full border-0 border-b-1 border-gray-400 bg-transparent focus:border-black focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          {/* Password Input and Show/Hide Button */}
          <div className="space-y-1">
            <div className="p-1 px-5 bg-gray-100 rounded-md border border-gray-300 drop-shadow-sm drop-shadow-black">
              <div className="mb-1 border-b-2 border-gray-400 focus-within:border-black">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full border-0 border-b-1 border-gray-400 bg-transparent focus:border-black focus:outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-1 top-1 text-gray-500 text-sm px-5"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <a>
              <p 
              className="text-sm text-right text-gray-600 hover:underline cursor-pointer"
              onClick={() => navigate("/forgot-password")}>
                Forgot Password?
              </p>
            </a>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="space-y-10">
            {/* Login Button*/}
            <button
              type="submit"
              className="w-full bg-gray-100 text-black py-3 border-2 border-black-300 rounded-sm  drop-shadow-sm drop-shadow-black hover:bg-gray-300 transition"
            >
              Login
            </button>
            {/* Register Button */}
            <button
              type="submit"
              className="w-full bg-gray-100 text-black py-3 border-2 border-black-300 rounded-sm  drop-shadow-sm drop-shadow-black hover:bg-gray-300 transition"
              onClick={() => navigate("/register")}
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
