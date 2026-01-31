import { useState, useEffect, useRef } from "react";
import { MenuIcon, XIcon, LogOut, Settings, User, Zap, ChevronDown, LayoutGrid, Image as ImageIcon, Globe, IndianRupeeIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user, credits, logout } = useAuth();
    
    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsOpen(false);
        setDropdownOpen(false);
    }, [location.pathname]);

    const getInitials = (username: string) => {
        if (!username) return "U";
        const parts = username.trim().split(/\s+/);
        if (parts.length > 1) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return username.substring(0, 2).toUpperCase();
    };

    const handleLogout = async () => {
        try {
            const serverUrl = import.meta.env.VITE_SERVER_API_URI;
            const response = await fetch(`${serverUrl}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                toast.success('Logged out successfully');
                logout();
                navigate('/login');
            } else {
                throw new Error();
            }
        } catch (error) {
            toast.error('Session ended');
            logout(); // Force local logout anyway
            navigate('/login');
        }
    };

    const navLinks = [
        { name: "Home", path: "/", icon: <Globe size={16}/> },
        { name: "Generate", path: "/generate", icon: <ImageIcon size={16}/> },
        { name: "Gallery", path: "/my-gallery", icon: <LayoutGrid size={16}/> },
        { name: "Community", path: "/community", icon: <User size={16}/> },
        { name: "Pricing", path: "/pricing", icon: <IndianRupeeIcon size={16}/> },
    ];

    return (
        <>
            <motion.nav 
                className="fixed top-0 z-[60] flex items-center justify-between w-full py-4 px-6 md:px-16 lg:px-24 xl:px-32 backdrop-blur-xl bg-black/20 border-b border-white/5"
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 30 }}
            >
                {/* Logo */}
                <Link to="/" className="relative z-10 hover:opacity-80 transition-opacity">
                    <img className="h-8 md:h-9 w-auto" src="/assets/logo.svg" alt="logo" />
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5">
                    {navLinks.map((link) => (
                        <Link 
                            key={link.path} 
                            to={link.path} 
                            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                location.pathname === link.path 
                                ? "bg-pink-600 text-white shadow-lg shadow-pink-600/20" 
                                : "text-zinc-400 hover:text-white hover:bg-white/5"
                            }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-3">
                    {!isAuthenticated ? (
                        <button 
                            onClick={() => navigate("/login")} 
                            className="hidden sm:block px-7 py-2.5 bg-pink-600 text-neutral-300 hover:bg-pink-700 active:scale-95 transition-all rounded-full text-sm font-bold"
                        >
                            Sign In
                        </button>
                    ) : (
                        <div className="flex items-center gap-3">
                            {/* Desktop Credit Badge */}
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
                                <motion.div
                                    key={credits?.credits} // Pulse whenever credit number changes
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <Zap size={14} className="text-yellow-500 fill-yellow-500" />
                                </motion.div>
                                <span className="text-xs font-bold text-yellow-500">{credits?.credits ?? 0}</span>
                            </div>

                            {/* User Dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <button 
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center gap-2 p-1 pr-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center font-bold text-xs text-white">
                                        {user ? getInitials(user.username) : "U"}
                                    </div>
                                    <ChevronDown size={14} className={`text-zinc-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                                </button>
                                
                                <AnimatePresence>
                                    {dropdownOpen && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-3 w-64 bg-zinc-900 border border-white/10 rounded-[24px] shadow-2xl overflow-hidden z-50"
                                        >
                                            <div className="px-5 py-5 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
                                                <p className="text-sm font-bold text-white truncate">{user?.username}</p>
                                                <p className="text-[11px] text-zinc-500 truncate mt-0.5">{user?.email}</p>
                                                <div className="flex items-center justify-between mt-4 p-2 bg-black/40 rounded-xl border border-white/5">
                                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Balance</span>
                                                    <div className="flex items-center gap-1">
                                                        <Zap size={12} className="text-yellow-400 fill-yellow-400" />
                                                        <span className="text-xs font-black text-white">{credits?.credits ?? 0}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="p-2">
                                                <Link to="/manage-account" className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-xl transition text-sm text-zinc-300 hover:text-white">
                                                    <div className="p-1.5 bg-white/5 rounded-lg"><User size={14} /></div> 
                                                    Profile Settings
                                                </Link>
                                                <Link to="/settings" className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-xl transition text-sm text-zinc-300 hover:text-white">
                                                    <div className="p-1.5 bg-white/5 rounded-lg"><Settings size={14} /></div> 
                                                    Preferences
                                                </Link>
                                                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-red-500/10 transition text-sm text-red-400 mt-1 border-t border-white/5">
                                                    <div className="p-1.5 bg-red-500/10 rounded-lg"><LogOut size={14} /></div> 
                                                    Sign Out
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button onClick={() => setIsOpen(true)} className="lg:hidden p-2 text-white hover:bg-white/5 rounded-lg">
                        <MenuIcon size={24} />
                    </button>
                </div>
            </motion.nav>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            <img className="h-7 w-auto" src="/assets/logo.svg" alt="logo" />
                            <button onClick={() => setIsOpen(false)} className="p-2 bg-white/5 rounded-full text-white">
                                <XIcon size={20} />
                            </button>
                        </div>

                        <div className="flex flex-col p-6 gap-2">
                            {navLinks.map((link) => (
                                <Link 
                                    key={link.path} 
                                    to={link.path} 
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center gap-4 p-4 rounded-2xl text-lg font-medium transition-all ${
                                        location.pathname === link.path ? "bg-pink-600 text-white" : "text-zinc-400"
                                    }`}
                                >
                                    {link.icon} {link.name}
                                </Link>
                            ))}
                        </div>

                        <div className="mt-auto p-8 border-t border-white/5 bg-zinc-900/50">
                            {isAuthenticated ? (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-pink-600 flex items-center justify-center font-bold text-white shadow-lg shadow-pink-600/20">
                                            {user ? getInitials(user.username) : "U"}
                                        </div>
                                        <div>
                                            <p className="text-white font-bold">{user?.username}</p>
                                            <div className="flex items-center gap-1.5 text-yellow-500">
                                                <Zap size={12} fill="currentColor" />
                                                <span className="text-xs font-black">{credits?.credits ?? 0} Credits</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={handleLogout} className="w-full py-4 bg-red-500/10 text-red-500 rounded-2xl font-bold flex items-center justify-center gap-2">
                                        <LogOut size={18} /> Sign Out
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => { navigate("/login"); setIsOpen(false); }} 
                                    className="w-full py-4 bg-white text-black rounded-2xl font-bold active:scale-95 transition-all"
                                >
                                    Get Started
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}