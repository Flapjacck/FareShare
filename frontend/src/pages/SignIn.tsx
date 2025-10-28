import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { ApiClientError } from "../utils/api";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, AlertCircle } from "lucide-react";

export default function SignIn() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Basic validation
    if (!email.trim()) {
      setErrors("Email is required");
      return;
    }
    if (!password) {
      setErrors("Password is required");
      return;
    }
    
    setSubmitting(true);
    setErrors(null);
    
    try {
      // Login using auth context
      await login(email, password);
      
      // Redirect to home page on success
      navigate("/", { replace: true });
    } catch (error) {
      // Handle API errors
      if (error instanceof ApiClientError) {
        setErrors(error.detail);
      } else {
        setErrors("Login failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center px-6 overflow-hidden" style={{ height: 'calc(100vh - 80px)', backgroundColor: 'var(--color-background-warm)' }}>
      {/* Logo */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <img src="/FareShare_Logo.png" alt="FareShare" className="h-24 md:h-32" />
      </motion.div>

      <motion.div 
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {errors && (
          <motion.div 
            className="mb-4 p-3 text-sm text-white rounded-lg flex items-center gap-2" 
            style={{ backgroundColor: 'rgba(var(--color-primary-rgb), 0.9)' }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <AlertCircle size={18} />
            {errors}
          </motion.div>
        )}
        
        <form onSubmit={onSubmit} className="bg-white rounded-xl shadow-[0_10px_30px_rgba(252,74,26,0.12)] px-8 py-10">
          <div className="mb-6">
            <label className="text-sm font-semibold mb-2 flex items-center gap-1" style={{ color: 'var(--color-primary)' }}>
              <Mail size={16} />
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="w-full bg-white border-b-2 outline-none py-2 px-1 transition-colors"
              style={{ borderBottomColor: 'var(--color-secondary)' }}
              onFocus={(e) => e.currentTarget.style.borderBottomColor = 'var(--color-primary)'}
              onBlur={(e) => e.currentTarget.style.borderBottomColor = 'var(--color-secondary)'}
              placeholder="john@example.com"
              aria-label="Email"
            />
          </div>

          <div className="mb-3">
            <label className="text-sm font-semibold mb-2 flex items-center gap-1" style={{ color: 'var(--color-primary)' }}>
              <Lock size={16} />
              Password
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="w-full bg-white border-b-2 outline-none py-2 px-1 transition-colors"
              style={{ borderBottomColor: 'var(--color-secondary)' }}
              onFocus={(e) => e.currentTarget.style.borderBottomColor = 'var(--color-primary)'}
              onBlur={(e) => e.currentTarget.style.borderBottomColor = 'var(--color-secondary)'}
              placeholder="Password"
              aria-label="Password"
            />
          </div>

          <div className="text-right mb-6">
            <Link 
              to="#" 
              className="text-sm underline transition-colors hover:opacity-80" 
              style={{ color: 'var(--color-accent)' }} 
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'} 
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              Forgot Password?
            </Link>
          </div>

          <div className="mb-4">
            <motion.button 
              type="submit" 
              disabled={submitting}
              className="w-full text-white rounded-lg py-3 font-semibold shadow-md transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
              style={{ backgroundColor: submitting ? undefined : 'var(--color-primary)' }}
              whileHover={{ scale: submitting ? 1 : 1.02 }}
              whileTap={{ scale: submitting ? 1 : 0.98 }}
            >
              {submitting ? (
                "Logging in..."
              ) : (
                <>
                  <LogIn size={18} />
                  Login
                </>
              )}
            </motion.button>
          </div>

          <div className="flex justify-center">
            <Link 
              to="/signup" 
              className="text-center text-sm font-medium transition-colors" 
              style={{ color: '#4a5568' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'} 
              onMouseLeave={(e) => e.currentTarget.style.color = '#4a5568'}
            >
              Don't have an account? <span className="underline">Register</span>
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
