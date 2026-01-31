import React, { useEffect, useState } from "react";
import SoftBackDrop from "./SoftBackDrop";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { User, KeyRound, ArrowLeft, RefreshCw, Mail, Lock } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { user, isLoading, isAuthenticated, login } = useAuth();
  const serverUrl = import.meta.env.VITE_SERVER_API_URI;

  // Flow States: 'login' | 'register' | 'verify'
  const [state, setState] = useState<"login" | "register" | "verify">("login");
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // Form Data is maintained throughout the 'register' -> 'verify' transition
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      navigate('/generate');
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  // Timer for Resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // 1. Handle Initial Action (Login or Request OTP)
  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (state === "login") {
        const response = await fetch(`${serverUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ userId: formData.email, password: formData.password }),
        });
        const data = await response.json();
        if (response.ok) {
          login(data.user);
          navigate('/generate');
        } else {
          toast.error(data.message || "Login failed");
        }
      } else {
        // REGISTER FLOW: Request OTP first
        const response = await fetch(`${serverUrl}/api/auth/register/request-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: formData.username, email: formData.email }),
        });
        const data = await response.json();
        if (response.ok) {
          toast.success("OTP sent to your email!");
          setState("verify");
          setResendTimer(5);
        } else {
          toast.error(data.message || "Registration failed");
        }
      }
    } catch (err) {
      toast.error("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Final Registration (Verify OTP + Create Account)
  const handleFinalRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${serverUrl}/api/auth/register/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          otp
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Account verified and created!");
        setTimeout(() => {
          toast.success("🎁 50 Credits added to your account for free!", {
            duration: 5000,
            icon: '💰',
            style: {
              border: '1px solid #db2777',
              padding: '16px',
              color: '#fff',
              backgroundColor: '#18181b',
            },
          });
        }, 800);
        login(data.user);
        navigate('/generate');
      } else {
        toast.error(data.message || "Invalid OTP");
      }
    } catch (err) {
      toast.error("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || loading) return;

    setLoading(true);
    const loadingToast = toast.loading("Sending new code...");

    try {
      const response = await fetch(`${serverUrl}/api/auth/register/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("New code sent!", { id: loadingToast });
        setResendTimer(60); // Reset timer to 60s after successful resend
      } else {
        toast.error(data.message || "Failed to resend", { id: loadingToast });
      }
    } catch (err) {
      toast.error("Failed to resend code. Check your connection.", { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <SoftBackDrop />

      <div className="z-10 w-full max-w-md bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">

        {state === "verify" && (
          <button onClick={() => setState("register")} className="mb-6 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm">
            <ArrowLeft size={16} /> Edit Registration Info
          </button>
        )}

        <h1 className="text-pink-600 text-3xl font-semibold text-center">
          {state === "login" ? "Login" : state === "register" ? "Sign Up" : "Verify Email"}
        </h1>
        <p className="text-zinc-400 text-sm mt-2 text-center">
          {state === "verify" ? `Enter the 6-digit code sent to ${formData.email}` : `Access your AI thumbnail workspace`}
        </p>

        {state !== "verify" ? (
          <form onSubmit={handleInitialSubmit} className="space-y-4 mt-8">
            {state === "register" && (
              <div className="flex items-center bg-white/5 ring-1 ring-white/10 focus-within:ring-pink-500/50 h-12 rounded-2xl px-5 gap-3 transition-all">
                <User size={18} className="text-zinc-500" />
                <input type="text" name="username" placeholder="Username" className="w-full bg-transparent text-white outline-none" value={formData.username} onChange={handleChange} required />
              </div>
            )}

            <div className="flex items-center bg-white/5 ring-1 ring-white/10 focus-within:ring-pink-500/50 h-12 rounded-2xl px-5 gap-3 transition-all">
              <Mail size={18} className="text-zinc-500" />
              <input type={state === "login" ? "text" : "email"} name="email" placeholder={state === "login" ? "Email or Username" : "Email"} className="w-full bg-transparent text-white outline-none" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="flex items-center bg-white/5 ring-1 ring-white/10 focus-within:ring-pink-500/50 h-12 rounded-2xl px-5 gap-3 transition-all">
              <Lock size={18} className="text-zinc-500" />
              <input type="password" name="password" placeholder="Password" className="w-full bg-transparent text-white outline-none" value={formData.password} onChange={handleChange} required />
            </div>

            <button type="submit" disabled={loading} className="w-full h-12 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3">
              {loading ? <RefreshCw className="animate-spin" size={20} /> : (state === "login" ? "Login" : "Register")}
            </button>
          </form>
        ) : (
          /* OTP INPUT FORM */
          <form onSubmit={handleFinalRegister} className="space-y-6 mt-8 text-center">
            <div className="flex justify-center">
              <div className="p-4 bg-pink-500/10 rounded-full text-pink-500">
                <KeyRound size={32} />
              </div>
            </div>

            <input
              type="text" maxLength={6} required placeholder="000000"
              className="w-full bg-white/5 border border-white/10 rounded-2xl h-16 text-center text-3xl tracking-[0.5em] text-white focus:border-pink-500 outline-none transition-all font-mono"
              value={otp} onChange={(e) => setOtp(e.target.value)}
            />

            <button type="submit" disabled={loading} className="w-full h-14 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-2xl transition-all flex items-center justify-center">
              {loading ? <RefreshCw className="animate-spin" size={20} /> : "Verify & Sign Up"}
            </button>

            <button type="button" onClick={handleResendOtp} disabled={resendTimer > 0} className="text-sm text-zinc-500 hover:text-pink-400 disabled:opacity-50 underline underline-offset-4">
              {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend OTP"}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <p className="text-zinc-500 text-sm">
            {state === "login" ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => setState(state === "login" ? "register" : "login")}
              className="ml-2 text-pink-500 font-medium hover:underline"
            >
              {state === "login" ? "Sign up" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;