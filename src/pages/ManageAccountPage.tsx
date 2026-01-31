import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SoftBackDrop from "../components/SoftBackDrop";
import { useAuth } from "../context/AuthContext";
import {
  User, Lock, Coins, ShieldCheck,
  Save, Loader2, Trash2, X, KeyRound, Eye, EyeOff, RefreshCw
} from "lucide-react";
import toast from "react-hot-toast";

const serverUrl = import.meta.env.VITE_SERVER_API_URI;

const ManageAccountPage = () => {
  const navigate = useNavigate();
  const { user, credits, isAuthenticated, isLoading, checkAuth } = useAuth();

  const [isUpdating, setIsUpdating] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Modal & Password State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [profileData, setProfileData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    accountTiers: user?.accountTiers || "Free",
  });

  // 1. Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error("Please login to access this page");
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, navigate]);

  // 2. Cooldown Timer Logic
  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Sync profile data with user context
  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || "",
        email: user.email || "",
        accountTiers: user.accountTiers || "Free",
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await fetch(`${serverUrl}/api/manage/update-profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: profileData.username,
          email: profileData.email
        }),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      await checkAuth();
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRequestOtp = async () => {
    const loadingToast = toast.loading("Sending OTP to your email...");
    try {
      const res = await fetch(`${serverUrl}/api/manage/request-otp`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!res.ok) throw new Error("Could not send OTP");

      toast.success("OTP sent!", { id: loadingToast });
      setShowOtpModal(true);
      setResendTimer(60); // Initial cooldown
    } catch (err: any) {
      toast.error(err.message, { id: loadingToast });
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || isResending) return;
    setIsResending(true);
    const loadingToast = toast.loading("Resending a fresh code...");
    try {
      const res = await fetch(`${serverUrl}/api/manage/resend-otp`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!res.ok) throw new Error("Failed to resend");

      toast.success("New OTP sent!", { id: loadingToast });
      setResendTimer(60);
    } catch (err: any) {
      toast.error(err.message, { id: loadingToast });
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await fetch(`${serverUrl}/api/manage/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: otpValue, newPassword }),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Password updated successfully!");
      setShowOtpModal(false);
      setOtpValue("");
      setNewPassword("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    // 1. Safety Guard: Double confirmation
    const firstCheck = window.confirm("Are you sure you want to delete your account? This action is permanent.");
    if (!firstCheck) return;

    const secondCheck = window.confirm("FINAL WARNING: All your thumbnails, credits, and profile data will be purged. Proceed?");
    if (!secondCheck) return;

    const loadingToast = toast.loading("Purging account data...");

    try {
      // 2. The API Call
      const res = await fetch(`${serverUrl}/api/manage/delete-account`, {
        method: 'DELETE',
        credentials: 'include' // Important for session/cookie clearance
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Deletion failed");

      // 3. Success Feedback
      toast.success("Account deleted successfully.", { id: loadingToast });

      // 4. Cleanup & Redirect
      // We use window.location instead of navigate because we want a full refresh 
      // to clear any residual data in the AuthContext.
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);

    } catch (err: any) {
      toast.error(err.message, { id: loadingToast });
      console.error("Delete Error:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-pink-500 size-10" />
      </div>
    );
  }

  return (
    <>
      <SoftBackDrop />

      <AnimatePresence>
        {showOtpModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0f0f0f] border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl relative"
            >
              <button onClick={() => setShowOtpModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
                <X size={24} />
              </button>

              <div className="text-center mb-8">
                <div className="size-16 bg-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-pink-500">
                  <KeyRound size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white">Security Check</h2>
                <p className="text-zinc-400 text-sm mt-2">Enter the OTP sent to <b>{user?.email}</b></p>
              </div>

              <form onSubmit={handleVerifyAndReset} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase ml-1">6-Digit Code</label>
                  <input
                    type="text" maxLength={6} required placeholder="000000" value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-center text-2xl tracking-[0.5em] focus:border-pink-500 outline-none transition-all placeholder:text-zinc-800"
                  />

                  {/* Resend OTP Button */}
                  <div className="flex justify-center pt-2">
                    <button
                      type="button"
                      disabled={resendTimer > 0 || isResending}
                      onClick={handleResendOtp}
                      className="text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                      {resendTimer > 0 ? (
                        <span className="text-zinc-500 flex items-center gap-2">
                          <RefreshCw size={12} className="animate-spin" /> Resend in {resendTimer}s
                        </span>
                      ) : (
                        <span className="text-pink-500 hover:text-pink-400 underline underline-offset-4 cursor-pointer">
                          Didn't get the code? Resend
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase ml-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"} required placeholder="••••••••" value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-pink-500 outline-none transition-all"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  disabled={isUpdating}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
                >
                  {isUpdating ? <Loader2 className="animate-spin" size={20} /> : "Reset Password"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 mt-32 min-h-screen px-6 md:px-16 lg:px-24 xl:px-32 pb-20">
        <div className="mb-12 border-l-4 border-pink-500 pl-6">
          <h1 className="text-3xl font-semibold text-neutral-200">Manage Account</h1>
          <p className="mt-1 text-lg text-neutral-500">Manage your profile and track your usage.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center backdrop-blur-md">
              <div className="size-20 bg-gradient-to-tr from-pink-600 to-violet-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-pink-500/20">
                <User className="size-10 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white uppercase tracking-tight">{user?.username}</h2>
              <p className="text-neutral-500 text-sm mb-6">{user?.email}</p>

              <div className="w-full pt-6 border-t border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-2 text-neutral-400">
                  <Coins size={18} className="text-amber-500" />
                  <span className="text-sm font-medium">Available Credits</span>
                </div>
                <span className="text-white font-black text-lg">{credits?.credits || 0}</span>
              </div>
            </div>

            <div className="bg-pink-500/5 border border-pink-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <ShieldCheck className="text-pink-500" size={20} />
                <h3 className="text-white font-semibold">Account Status</h3>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                You are currently using the <b className="text-pink-500">{profileData.accountTiers} Tier</b>.
              </p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <h3 className="text-lg font-medium text-white mb-4">Profile Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Username</label>
                    <input
                      type="text" required value={profileData.username}
                      onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Email Address</label>
                    <input
                      type="email" required value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500 transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4 flex flex-col md:flex-row gap-4">
                  <button disabled={isUpdating} type="submit" className="flex-1 flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-8 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-pink-600/20">
                    {isUpdating ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Save Changes
                  </button>
                  <button type="button" onClick={handleRequestOtp} className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-medium py-3 px-8 rounded-xl border border-white/10 transition-all">
                    <Lock size={18} /> Change Password
                  </button>
                </div>
              </form>
              <div className="mt-12 pt-8 border-t border-white/10">
                <h3 className="text-lg font-medium text-red-500 mb-2">Danger Zone</h3>
                <p className="text-sm text-neutral-500 mb-4">Deleting your account will remove all generated thumbnails and remaining credits.</p>
                <button onClick={() => { handleDeleteAccount() }} className="flex items-center gap-2 text-red-500 hover:bg-red-500/10 border border-red-500/20 px-6 py-2 rounded-lg transition-all text-sm font-bold">
                  <Trash2 size={16} />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ManageAccountPage;