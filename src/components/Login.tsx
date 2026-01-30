import React, { useEffect, useState } from "react"
import SoftBackDrop from "./SoftBackDrop"
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { User } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { user, isLoading, isAuthenticated, login } = useAuth();
  const [state, setState] = useState("login");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });

  // Redirect if already logged in (only on initial load)
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      navigate('/generate');
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    const serverUrl = import.meta.env.VITE_SERVER_API_URI;
    const endpoint = state === 'login' ? '/api/auth/login' : '/api/auth/register';
    
    try {
      const payload = state === 'login' 
        ? { userId: formData.email, password: formData.password } // backend expects userId for login
        : { username: formData.username, email: formData.email, password: formData.password };

      const response = await fetch(`${serverUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await response.json(); // Call this ONLY ONCE

      if (response.ok) {
        toast.success(data.message || "Success!");
        if (data.user) {
          login(data.user); // Update context
          navigate('/generate'); // Immediate navigation
        }
      } else {
        toast.error(data.message || 'Authentication failed');
      }
    } catch (error) {
      console.log(error);
      
      toast.error("Connection failed. Is the server running?");
    } finally {
      setLoading(false);
      // Only clear password for security, keep email/username for convenience if login fails
      setFormData(prev => ({ ...prev, password: '' }));
    }
  };
  
  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <SoftBackDrop />
      <form onSubmit={handleSubmit} className="z-10 mt-12 w-full sm:w-87.5 text-center bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-2xl px-8 pb-10">
        <h1 className="text-pink-600 text-3xl mt-10 font-medium">
          {state === "login" ? "Login" : "Sign up"}
        </h1>
        <p className="text-zinc-400 text-sm mt-2">Please {state} to continue</p>

        <div className="space-y-4 mt-8">
          {state !== "login" && (
            <div className="flex items-center w-full bg-white/5 ring-1 ring-white/10 focus-within:ring-pink-500/60 h-12 rounded-full px-6 gap-3 transition-all">
               <User size={18} className="text-white/50" />
               <input type="text" name="username" placeholder="Username" className="w-full bg-transparent text-white outline-none" value={formData.username} onChange={handleChange} required />
            </div>
          )}

          <div className="flex items-center w-full bg-white/5 ring-1 ring-white/10 focus-within:ring-pink-500/60 h-12 rounded-full px-6 gap-3 transition-all">
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/50"><path d="M22 12c0-1.2-.4-2.3-1.1-3.2a10 10 0 1 0-2 11.4c.8.9 1.9 1.4 3.1 1.4h2v-2h-2c-.7 0-1.4-.3-1.9-.8a8 8 0 1 1 2-11.2c.4.6.6 1.3.6 2.1v2a3 3 0 1 1-6 0v-4" /><circle cx="12" cy="12" r="3" /></svg>
             <input type={state === 'login' ? 'text' : 'email'} name="email" placeholder={state === 'login' ? 'Email or Username' : 'Email'} className="w-full bg-transparent text-white outline-none" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="flex items-center w-full bg-white/5 ring-1 ring-white/10 focus-within:ring-pink-500/60 h-12 rounded-full px-6 gap-3 transition-all">
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/50"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
             <input type="password" name="password" placeholder="Password" className="w-full bg-transparent text-white outline-none" value={formData.password} onChange={handleChange} required />
          </div>
        </div>

        <button type="submit" disabled={loading} className={`mt-8 w-full h-12 rounded-full text-white font-semibold transition flex items-center justify-center gap-2 ${loading ? 'bg-pink-600/50' : 'bg-pink-600 hover:bg-pink-500 active:scale-[0.98]'}`}>
          {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (state === "login" ? "Login" : "Create Account")}
        </button>

        {/* <div className="h-[1px] mt-6 w-full px-6 bg-gradient-to-br from-neutral-800 via-neutral-400 to-neutral-800 rounded-2xl" /> */}

        <p className="text-zinc-400 text-sm mt-6">
          {state === "login" ? "Don't have an account?" : "Already have an account?"}
          <span onClick={() => setState(state === 'login' ? 'register' : 'login')} className="text-pink-400 hover:underline ml-1 cursor-pointer">
            {state === 'login' ? 'Sign up' : 'Login'}
          </span>
        </p>
      </form>
    </div>
  );
}

export default Login