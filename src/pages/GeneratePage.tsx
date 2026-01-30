import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SoftBackDrop from "../components/SoftBackDrop";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { checkUserCredits, useAuth } from "../context/AuthContext";
import {
  ImageIcon,
  ChevronDown,
  Upload,
  Loader2,
  Check,
  Sparkles,
  Square,
  PenTool,
  Cpu,
  Image as ImageLucide,
  User,
  InfoIcon,
} from "lucide-react";
import { useParams } from "react-router-dom";

// --- Configuration Data (Kept exactly the same) ---
const STYLES = [
  { id: "Bold & Graphic", label: "Bold & Graphic", desc: "High contrast, striking visuals", icon: Sparkles },
  { id: "Minimalist", label: "Minimalist", desc: "Clean, simple, lots of white space", icon: Square },
  { id: "Photorealistic", label: "Photorealistic", desc: "Photo-based, natural looking", icon: ImageLucide },
  { id: "Illustrated", label: "Illustrated", desc: "Hand-drawn, artistic, creative", icon: PenTool },
  { id: "Tech/Futuristic", label: "Tech/Futuristic", desc: "Modern, sleek, tech-inspired", icon: Cpu },
];

const COLOR_SCHEMES = [
  { id: "vibrant", name: "Vibrant", colors: ["#FF6B6B", "#4ECDC4", "#45B7D1"] },
  { id: "sunset", name: "Sunset", colors: ["#FF8C42", "#FF3C38", "#A23B72"] },
  { id: "forest", name: "Ocean", colors: ["#0077B6", "#00B4D8", "#90E0EF"] },
  { id: "neon", name: "Forest", colors: ["#2D6A4F", "#40916C", "#95D5B2"] },
  { id: "purple", name: "Purple", colors: ["#7B2CBF", "#9D4EDD", "#C77DFF"] },
  { id: "monochrome", name: "Mono", colors: ["#212529", "#495057", "#ADB5BD"] },
  { id: "ocean", name: "Neon", colors: ["#FF00FF", "#00FFFF", "#FFFF00"] },
  { id: "pastel", name: "Pastel", colors: ["#FFB5A7", "#FCD5CE", "#F8EDEB"] },
];

const MODELS = [
  { id: "premium", label: "Premium", credits: 20 },
  { id: "basic", label: "Basic", credits: 10 },
];

const INITIAL_STATE = {
  title: "",
  aspect: "16:9" as "16:9" | "1:1" | "9:16",
  style: STYLES[0].id,
  colorScheme: COLOR_SCHEMES[1].id,
  priceModel: MODELS[0].id,
  prompt: "",
  imageFile: null as File | null,
};

const GeneratePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, fetchCredits } = useAuth();

  // Check authentication on mount
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error('Please login to access this page');
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, navigate]);

  // --- UI & Form States ---
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [optimizedPrompt, setOptimizedPrompt] = useState("");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [styleOpen, setStyleOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);

  // LOGIC FIX: Separate User Upload Preview from Backend Result Image
  const [userUploadPreview, setUserUploadPreview] = useState<string | null>(null); 
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const serverUrl = import.meta.env.VITE_SERVER_API_URI;

  const handleInputChange = (field: keyof typeof INITIAL_STATE, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMagicEnhance = async () => {
    if (!formData.prompt) return toast.error("Write a description first!");
    setIsOptimizing(true);

    try {
      const response = await fetch(`${serverUrl}/api/thumbnail/optimize-prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.prompt,
          style: formData.style
        }),
        // Include credentials if you're using cookies for sessions
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to enhance prompt");
      }

      setOptimizedPrompt(data.optimized);
      toast.success("Prompt enhanced!");
    } catch (error: any) {
      console.error("FETCH ERROR:", error.message);
      toast.error(error.message);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleInputChange("imageFile", file);
      const url = URL.createObjectURL(file);
      setUserUploadPreview(url); // Logic: Only update the local upload preview
    }
  };

  const getAspectRatioClass = () => {
    switch (formData.aspect) {
      case "1:1": return "aspect-square max-w-[400px]";
      case "9:16": return "aspect-[9/16] max-h-[500px]";
      default: return "aspect-video w-full";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const selectedModel = MODELS.find(m => m.id === formData.priceModel);
    const hasCredits = await checkUserCredits();

    if (!hasCredits) {
      // Refresh credits in navbar
      await fetchCredits();

      toast.error("Insufficient balance", {
        icon: <InfoIcon />,
      });
      navigate("/pricing");
      return;
    }

    try {
      // Step A: Generate Thumbnail
      const requestData = {
        title: formData.title,
        style: formData.style,
        aspect_ratio: formData.aspect,
        color_scheme: formData.colorScheme,
        user_prompt: formData.prompt,
        prompt_used: optimizedPrompt || formData.prompt,
        priceModel: formData.priceModel,
      };

      const genRes = await fetch(`${serverUrl}/api/thumbnail/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
        credentials: 'include',
      });

      console.log(genRes);
      
      const genData = await genRes.json();

      console.log(genData);
      
      if (!genRes.ok) {
        throw new Error(genData.error || "Generation failed");
      }

      toast.success("Thumbnail generated successfully!");

      
      // Step B: Deduct Credits
      await fetch(`${serverUrl}/api/credits/deduct-credits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: selectedModel?.credits || 5 }),
        credentials: 'include',
      });
      
      // Refresh credits in navbar
      await fetchCredits();

      navigate(`/generate/${genData.thumbnail._id}`);

    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchGeneratedThumbnail = useCallback(async () => {
    // If no ID exists in the URL, we are in "Create Mode"
    if (!id) {
      setFormData(INITIAL_STATE);
      setResultImageUrl(null);
      setUserUploadPreview(null);
      setOptimizedPrompt("");
      return;
    }

    try {
      // 1. Fetch data from your live API
      // Using GET is standard for fetching data by ID
      const response = await fetch(`${serverUrl}/api/thumbnail/generate/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch thumbnail");
      }

      // 2. Extract the thumbnail object (assuming your API returns { thumbnail: {...} } or just {...})
      const thumbnail = data.data;


      // 3. Populate the Form State to match the fetched data
      setFormData({
        title: thumbnail.title || "",
        aspect: thumbnail.aspect_ratio || "16:9", // Map DB 'aspect_ratio' to state 'aspect'
        style: thumbnail.style || STYLES[2].id,
        colorScheme: thumbnail.color_scheme || COLOR_SCHEMES[1].id,
        priceModel: thumbnail.model || MODELS[1].id,
        prompt: thumbnail.prompt_used || "",
        imageFile: null, // Reset file input as we now have a result image
      });

      // 4. Update the Preview Panel (Right Panel)
      setResultImageUrl(thumbnail.imageUrl);

      // 5. Handle AI Optimized Prompt UI
      // If the prompt used by AI is different from user input, show the "Magic" UI
      if (thumbnail.prompt_used && thumbnail.prompt_used !== thumbnail.user_prompt) {
        setOptimizedPrompt(thumbnail.prompt_used);
      } else {
        setOptimizedPrompt("");
      }

      // 6. Clear local upload preview (we use resultImageUrl now)
      setUserUploadPreview(null);

    } catch (error: any) {
      console.error("Fetch Details Error:", error.message);
      toast.error("Thumbnail not found or access denied");
      navigate("/my-gallery"); // Redirect back to empty generate page on error
    }
  }, [id, navigate, serverUrl]);

  useEffect(() => {
    fetchGeneratedThumbnail();
  }, [fetchGeneratedThumbnail]);

  return (
    <div className="relative min-h-screen text-zinc-200 selection:bg-pink-500/30">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-white border-t-pink-500 rounded-full animate-spin"></div>
            <p className="text-zinc-400">Checking authentication...</p>
          </div>
        </div>
      ) : !isAuthenticated ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-zinc-400">Redirecting to login...</p>
          </div>
        </div>
      ) : (
        <>
          <SoftBackDrop />
          <div className="relative z-10 mt-12 pt-24 pb-20">
            <main className="max-w-6xl mx-auto px-4">
              <form onSubmit={handleSubmit} className="grid lg:grid-cols-[380px_1fr] gap-8 items-start">

                {/* --- LEFT PANEL --- */}
                <div className="rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl p-6 space-y-6 shadow-2xl">
                  <div>
                    <h2 className="text-xl font-semibold text-white tracking-tight">Create Your Thumbnail</h2>
                    <p className="text-sm text-zinc-400 mt-1">Fill in the details to generate</p>
                  </div>

                  {/* Title Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Title or Topic</label>
                    <input
                      required
                      disabled={loading}
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      maxLength={100}
                      placeholder="e.g., 10 Tips for Better Sleep"
                      className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Aspect Ratio Toggle */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-zinc-300">Aspect Ratio</label>
                    <div className="flex gap-2">
                      {(["16:9", "1:1", "9:16"] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          disabled={loading}
                          onClick={() => handleInputChange("aspect", r)}
                          className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed
                        ${formData.aspect === r
                              ? "bg-pink-500/10 border-pink-500 text-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.1)]"
                              : "border-white/5 text-zinc-500 hover:bg-white/5"}`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Thumbnail Style Dropdown */}
                  <div className="relative space-y-2">
                    <label className="text-sm font-medium text-zinc-300 block">Style</label>

                    <button
                      type="button"
                      onClick={() => { setStyleOpen(!styleOpen); setModelOpen(false); }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl bg-black/40 border transition-all
    ${styleOpen ? "border-pink-500 ring-2 ring-pink-500/20" : "border-white/10 hover:border-white/20"}`}
                    >
                      <div className="flex items-center gap-4 text-left overflow-hidden">
                        {(() => {
                          const s = STYLES.find(i => i.id === formData.style) || STYLES[2];
                          return (
                            <>
                              <div className="size-10 rounded-lg bg-pink-500/10 flex items-center justify-center shrink-0 border border-pink-500/20">
                                <s.icon className="size-5 text-pink-500" />
                              </div>
                              <div className="flex flex-col truncate">
                                <span className="text-sm font-semibold text-white leading-tight">{s.label}</span>
                                <span className="text-xs text-zinc-500 truncate mt-0.5">{s.desc}</span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                      <ChevronDown className={`size-4 text-zinc-500 shrink-0 transition-transform duration-300 ${styleOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {styleOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          className="absolute z-50 w-full mt-2 bg-[#0f0f0f] border border-white/10 rounded-xl overflow-hidden shadow-2xl backdrop-blur-3xl"
                        >
                          <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                            {STYLES.map((s) => (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => { handleInputChange("style", s.id); setStyleOpen(false); }}
                                className={`w-full flex items-center gap-4 px-4 py-3 hover:bg-white/5 text-left transition-colors border-b border-white/[0.03] last:border-0
              ${formData.style === s.id ? "bg-pink-500/5" : ""}`}
                              >
                                <div className={`size-9 rounded-lg flex items-center justify-center shrink-0 border 
                ${formData.style === s.id ? "bg-pink-500/20 border-pink-500/50" : "bg-white/5 border-white/10"}`}>
                                  <s.icon className={`size-4 ${formData.style === s.id ? "text-pink-500" : "text-zinc-500"}`} />
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <p className={`text-sm font-medium ${formData.style === s.id ? "text-pink-500" : "text-white"}`}>
                                    {s.label}
                                  </p>
                                  <p className="text-[11px] text-zinc-500 truncate">{s.desc}</p>
                                </div>
                                {formData.style === s.id && (
                                  <Check className="size-4 text-pink-500 ml-auto shrink-0" />
                                )}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Color Scheme Grid */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-zinc-300">Color Scheme</label>
                        <p className="text-[11px] text-zinc-500 capitalize leading-none">
                          Active: <span className="text-pink-500 font-medium">
                            {COLOR_SCHEMES.find(s => s.id === formData.colorScheme)?.name || formData.colorScheme}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2.5 p-2 rounded-xl bg-black/20 border border-white/5">
                      {COLOR_SCHEMES.map((scheme) => (
                        <button
                          key={scheme.id}
                          type="button"
                          disabled={loading}
                          onClick={() => handleInputChange("colorScheme", scheme.id)}
                          className={`group relative h-10 rounded-lg overflow-hidden border-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                          ${formData.colorScheme === scheme.id
                              ? "border-pink-500 scale-105 shadow-[0_0_15px_rgba(236,72,153,0.2)]"
                              : "border-transparent opacity-40 hover:opacity-100 hover:border-white/20"}`}
                          title={scheme.name}
                        >
                          <div className="flex h-full w-full">
                            {scheme.colors.map((c, i) => (
                              <div key={i} className="flex-1" style={{ backgroundColor: c }} />
                            ))}
                          </div>

                          {/* Subtle Checkmark overlay for selected state */}
                          {formData.colorScheme === scheme.id && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <Check className="size-3 text-white drop-shadow-md" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Model Selection */}
                  <div className="relative space-y-2">
                    <label className="text-sm font-medium text-zinc-400">AI Model</label>

                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => { setModelOpen(!modelOpen); setStyleOpen(false); }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl bg-black/40 border transition-all disabled:opacity-50 disabled:cursor-not-allowed
    ${modelOpen ? "border-pink-500 ring-2 ring-pink-500/20" : "border-white/10 hover:border-white/20"}`}
                    >
                      <div className="flex items-center gap-4 text-left overflow-hidden">
                        {(() => {
                          const m = MODELS.find(i => i.id === formData.priceModel) || MODELS[0];
                          const isPremium = m.id === "premium";
                          return (
                            <>
                              <div className={`size-10 rounded-lg flex items-center justify-center shrink-0 border ${isPremium ? "bg-amber-500/10 border-amber-500/20" : "bg-blue-500/10 border-blue-500/20"}`}>
                                <Cpu className={`size-5 ${isPremium ? "text-amber-500" : "text-blue-500"}`} />
                              </div>
                              <div className="flex flex-col truncate">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-white leading-tight">{m.label}</span>
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/5 text-zinc-400 border border-white/10">
                                    {m.credits} Credits
                                  </span>
                                </div>
                                <span className="text-xs text-zinc-500 truncate mt-0.5">
                                  {isPremium ? "High-fidelity results matching prompt details" : "Standard generation for quick results"}
                                </span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                      <ChevronDown className={`size-4 text-zinc-500 shrink-0 transition-transform duration-300 ${modelOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {modelOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          className="absolute z-50 w-full mt-2 bg-[#0f0f0f] border border-white/10 rounded-xl overflow-hidden shadow-2xl backdrop-blur-3xl"
                        >
                          <div className="flex flex-col">
                            {MODELS.map((m) => {
                              const isPremium = m.id === "premium";
                              const isActive = formData.priceModel === m.id;
                              return (
                                <button
                                  key={m.id}
                                  type="button"
                                  onClick={() => { handleInputChange("priceModel", m.id); setModelOpen(false); }}
                                  className={`w-full flex items-center gap-4 px-4 py-3 hover:bg-white/5 text-left transition-colors border-b border-white/[0.03] last:border-0
                ${isActive ? "bg-pink-500/5" : ""}`}
                                >
                                  <div className={`size-9 rounded-lg flex items-center justify-center shrink-0 border 
                  ${isActive ? "bg-pink-500/20 border-pink-500/50" : "bg-white/5 border-white/10"}`}>
                                    <Cpu className={`size-4 ${isActive ? "text-pink-500" : "text-zinc-500"}`} />
                                  </div>
                                  <div className="flex flex-col min-w-0 flex-1">
                                    <div className="flex items-center justify-between">
                                      <p className={`text-sm font-medium ${isActive ? "text-pink-500" : "text-white"}`}>
                                        {m.label}
                                      </p>
                                      <span className="text-[10px] font-mono text-zinc-500">{m.credits} CREDITS</span>
                                    </div>
                                    <p className="text-[11px] text-zinc-500 mt-0.5">
                                      {isPremium
                                        ? "Advanced reasoning for high-accuracy prompt following."
                                        : "Standard processing for balanced output."}
                                    </p>
                                  </div>
                                  {isActive && <Check className="size-4 text-pink-500 shrink-0" />}
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Photo Upload - LOGIC FIX: Shows userUploadPreview */}
                  <div className="space-y-2">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    <div onClick={() => fileInputRef.current?.click()} className="flex items-center gap-4 p-4 rounded-xl bg-black/40 border border-dashed border-white/10 hover:border-pink-500/50 cursor-pointer transition-all group">
                      <div className="size-12 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 overflow-hidden shrink-0">
                        {userUploadPreview ? <img src={userUploadPreview} alt="Preview" className="size-full object-cover" /> : <Upload className="size-5 text-zinc-500 group-hover:text-pink-500" />}
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-medium">User Photo</p>
                        <p className="text-xs text-zinc-500 truncate">{formData.imageFile ? formData.imageFile.name : "Optional reference"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Description & Magic Overlay Logic */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-zinc-300">Description</label>
                      <button
                        type="button"
                        onClick={handleMagicEnhance}
                        disabled={isOptimizing || !formData.prompt}
                        className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-pink-500 bg-pink-500/10 px-2 py-1 rounded-md hover:bg-pink-500/20 disabled:opacity-30 transition-all border border-pink-500/20"
                      >
                        {isOptimizing ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />}
                        Magic Enhance
                      </button>
                    </div>

                    <div className="relative h-48 w-full">
                      <div className={`h-full w-full rounded-xl border transition-all flex flex-col overflow-hidden
                        ${optimizedPrompt
                          ? "bg-[#0c0c0c] border-pink-500/50 shadow-lg shadow-pink-500/10"
                          : "bg-black/40 border-white/10 focus-within:border-pink-500/50"}`}
                      >

                        {/* HEADER: Only visible if optimizedPrompt exists */}
                        {optimizedPrompt && (
                          <div className="flex items-center justify-between px-3 py-2 bg-pink-500/10 border-b border-pink-500/20 shrink-0">
                            <div className="flex items-center gap-1.5">
                              <Sparkles className="size-3 text-pink-500" />
                              <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest">AI Optimized Prompt</span>
                            </div>
                          </div>
                        )}

                        {/* TEXTAREA: Switches between showing AI text or Original text */}
                        <textarea
                          value={optimizedPrompt || formData.prompt}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            if (optimizedPrompt) {
                              // If AI optimized prompt exists and user types, clear it and update original
                              setOptimizedPrompt("");
                              handleInputChange("prompt", newValue);
                            } else {
                              // Normal case: just update the prompt
                              handleInputChange("prompt", newValue);
                            }
                          }}
                          placeholder="Describe the scene..."
                          className={`w-full flex-1 px-4 py-3 bg-transparent outline-none resize-none text-sm transition-all custom-scrollbar overflow-y-auto
                          ${optimizedPrompt ? "italic text-zinc-300" : "text-zinc-200"}`}
                        />

                        {/* FOOTER: Only visible if optimizedPrompt exists */}
                        {optimizedPrompt && (
                          <div className="px-3 py-1.5 bg-black/40 border-t border-white/5 shrink-0">
                            <span className="text-[9px] text-zinc-500 italic flex items-center gap-1">
                              <User className="size-2.5" /> Original prompt preserved
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading || !formData.title}
                    className="relative w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-pink-600 to-pink-500 hover:opacity-90 disabled:opacity-40 transition-all overflow-hidden"
                  >
                    <div className="flex items-center justify-center gap-2">
                      {loading ? <><Loader2 className="size-5 animate-spin" /><span>Generating...</span></> : <span>Generate Thumbnail</span>}
                    </div>
                    {loading && <motion.div initial={{ x: "-100%" }} animate={{ x: "100%" }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="absolute inset-0 bg-white/10 skew-x-12" />}
                  </button>
                </div>

                {/* --- RIGHT PANEL - LOGIC FIX: Shows resultImageUrl --- */}
                <div className="rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl p-8 shadow-2xl sticky top-24 min-h-[500px] flex flex-col">
                  <div className="w-full flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">Preview</h2>
                    <span className="text-sm text-zinc-500">Aspect: {formData.aspect}</span>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <motion.div layout transition={{ type: "spring", stiffness: 200, damping: 25 }} className={`relative ${getAspectRatioClass()} rounded-2xl border-2 border-dashed border-white/10 bg-black/40 flex flex-col items-center justify-center text-center p-0 overflow-hidden`}>

                      {resultImageUrl ? (
                        <img src={resultImageUrl} className="w-full h-full object-cover" alt="Generated result" />
                      ) : (
                        <>
                          <div className="size-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10"><ImageIcon className="size-8 text-zinc-700" /></div>
                          <div className="px-4 text-center">
                            <p className="font text-zinc-200">Generate your first thumbnail</p>
                            <p className="mt-1 text-xs text-zinc-400">Fill out the form and click Generate</p>
                          </div>
                        </>
                      )}

                    </motion.div>
                  </div>
                </div>

              </form>
            </main>
          </div>
        </>
      )}
    </div>
  );
};

export default GeneratePage;