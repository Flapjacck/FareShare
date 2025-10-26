import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

type ApiError = {
  message?: string;
  details?: Record<string, string[]>;
};

export default function SignUp() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<"passenger" | "driver">("passenger");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    if (!username.trim()) return "Username is required";
    if (!email.trim()) return "Email is required";
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) return "Enter a valid email address";
    if (password.length < 8) return "Password must be at least 8 characters";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clientError = validate();
    if (clientError) {
      setErrors(clientError);
      return;
    }

    setSubmitting(true);
    setErrors(null);

    try {
      // send registration to backend - endpoint configurable via Vite env
      const resp = await fetch(import.meta.env.VITE_API_BASE_URL?.toString() ?? "/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email, first_name: firstName, last_name: lastName, role }),
      });

      if (resp.ok) {
        navigate("/signup/success", { replace: true });
        return;
      }

      const data: ApiError = await resp.json().catch(() => ({}));
      if (data && data.message) setErrors(data.message);
      else setErrors("Registration failed. Please check your input.");
    } catch (err) {
      setErrors("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white p-4 flex flex-col items-center">
      <div className="w-full max-w-md">
        <div className="flex items-center mb-4">
          <Link to="/signin" className="text-sm text-gray-700 mr-3">&lt; Back</Link>
          <img src="/fare-share-logo.png" alt="FareShare" className="h-16 mx-auto" />
        </div>

        <h2 className="text-center text-xl font-semibold mb-4">Registration</h2>

        {errors && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-sm text-red-800 rounded">{errors}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 bg-gray-50 p-4 rounded">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="mt-1 block w-full border-b-2 border-gray-300 py-2 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <input value={password} onChange={(e) => setPassword(e.target.value)} type={showPassword ? "text" : "password"} placeholder="Password" className="mt-1 block w-full border-b-2 border-gray-300 py-2 outline-none pr-12" />
              <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600">{showPassword ? "Hide" : "Show"}</button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email Address" className="mt-1 block w-full border-b-2 border-gray-300 py-2 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" className="mt-1 block w-full border-b-2 border-gray-300 py-2 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" className="mt-1 block w-full border-b-2 border-gray-300 py-2 outline-none" />
          </div>

          <div className="bg-white p-3 rounded mt-2">
            <div className="flex items-center mb-2">
              <input id="role-passenger" name="role" type="radio" checked={role === "passenger"} onChange={() => setRole("passenger")} className="mr-2" />
              <label htmlFor="role-passenger" className="text-sm">I will be a passenger</label>
            </div>
            <div className="flex items-center">
              <input id="role-driver" name="role" type="radio" checked={role === "driver"} onChange={() => setRole("driver")} className="mr-2" />
              <label htmlFor="role-driver" className="text-sm">I will be a driver</label>
            </div>
            <p className="text-xs text-gray-500 mt-2">(This can be updated later)</p>
          </div>

          <div>
            <button type="submit" disabled={submitting} className="w-full bg-white border border-gray-700 rounded py-3 font-medium shadow">Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
}
