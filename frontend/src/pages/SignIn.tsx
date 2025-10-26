import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function SignIn() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Placeholder: perform login flow here
    navigate("/", { replace: true });
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
      {/* Logo (place your provided PNG at frontend/public/fare-share-logo.png so it's available at /fare-share-logo.png) */}
      <div className="mb-6">
        <img src="/fare-share-logo.png" alt="FareShare" className="h-20 md:h-28" />
      </div>

      <div className="w-full max-w-md">
        <form onSubmit={onSubmit} className="bg-gray-50 rounded px-6 py-8 shadow-md">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white border-b-2 border-gray-300 focus:border-black outline-none py-2"
              placeholder="Username"
              aria-label="Username"
            />
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="w-full bg-white border-b-2 border-gray-300 focus:border-black outline-none py-2"
              placeholder="Password"
              aria-label="Password"
            />
          </div>

          <div className="text-right mb-4">
            <Link to="#" className="text-sm text-gray-600 underline">Forgot Password?</Link>
          </div>

          <div className="mb-4">
            <button type="submit" className="w-full bg-white border border-gray-700 text-gray-900 rounded py-3 font-medium shadow">
              Login
            </button>
          </div>

          <div className="flex justify-center">
            <Link to="/signup" className="w-1/2 text-center bg-gray-100 border border-gray-300 rounded py-2 text-sm">Register</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
