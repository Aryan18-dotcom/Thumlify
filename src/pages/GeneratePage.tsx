import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SoftBackDrop from "../components/SoftBackDrop";
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
  Image as ImageLucide
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom"; // Import useNavigate
import { dummyThumbnails } from "../assets";

// --- Configuration Data (Kept exactly the same) ---
const STYLES = [
  { id: "bold_graphic", label: "Bold & Graphic", desc: "High contrast, striking visuals", icon: Sparkles },
  { id: "minimalist", label: "Minimalist", desc: "Clean, simple, lots of white space", icon: Square },
  { id: "photorealistic", label: "Photorealistic", desc: "Photo-based, natural looking", icon: ImageLucide },
  { id: "illustrated", label: "Illustrated", desc: "Hand-drawn, artistic, creative", icon: PenTool },
  { id: "tech", label: "Tech/Futuristic", desc: "Modern, sleek, tech-inspired", icon: Cpu },
];

const COLOR_SCHEMES = [
  { id: "vibrant", name: "Vibrant", colors: ["#FF6B6B", "#4ECDC4", "#45B7D1"] },
  { id: "bold_graphic", name: "Sunset", colors: ["#FF8C42", "#FF3C38", "#A23B72"] },
  { id: "ocean", name: "Ocean", colors: ["#0077B6", "#00B4D8", "#90E0EF"] },
  { id: "forest", name: "Forest", colors: ["#2D6A4F", "#40916C", "#95D5B2"] },
  { id: "purple", name: "Purple", colors: ["#7B2CBF", "#9D4EDD", "#C77DFF"] },
  { id: "mono", name: "Mono", colors: ["#212529", "#495057", "#ADB5BD"] },
  { id: "neon", name: "Neon", colors: ["#FF00FF", "#00FFFF", "#FFFF00"] },
  { id: "pastel", name: "Pastel", colors: ["#FFB5A7", "#FCD5CE", "#F8EDEB"] },
];

const MODELS = [
  { id: "basic", label: "Basic", credits: 5 },
  { id: "premium", label: "Premium", credits: 10 }
];

const INITIAL_STATE = {
  title: "",
  aspect: "16:9" as "16:9" | "1:1" | "9:16",
  style: STYLES[2].id, 
  colorScheme: COLOR_SCHEMES[1].id,
  model: MODELS[1].id,
  prompt: "",
  imageFile: null as File | null,
};

const GeneratePage = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // Hook for navigation

  // --- UI & Form States ---
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [styleOpen, setStyleOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  
  // LOGIC FIX: Separate User Upload Preview from Backend Result Image
  const [userUploadPreview, setUserUploadPreview] = useState<string | null>(null);
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Handlers ---
  const handleInputChange = (field: keyof typeof INITIAL_STATE, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

    try {
      console.log("Hitting API: http://localhost:5173/generate");
      
      // Simulated API Call
      await new Promise(resolve => setTimeout(resolve, 3000));

      // LOGIC: Replace this with your actual API response ID
      const generatedId = "69451ff3c9ea67e4c930f6a6"; 
      
      // Cleanup local preview to avoid memory leaks
      if (userUploadPreview) URL.revokeObjectURL(userUploadPreview);
      
      // LOGIC: Redirect to the new ID route
      navigate(`/generate/${generatedId}`);

    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  // LOGIC FIX: Use useCallback so it's stable for useEffect
  const fetchGeneratedThumbnail = useCallback(() => {
    if(!id) {
        // Reset states if we navigate back to /generate
        setFormData(INITIAL_STATE);
        setResultImageUrl(null);
        setUserUploadPreview(null);
        return;
    }

    const thumbnail: any = dummyThumbnails.find((t) => t._id === id);
    if (thumbnail) {
      setFormData({
        title: thumbnail.title,
        aspect: thumbnail.aspect || "16:9",
        style: thumbnail.style,
        colorScheme: thumbnail.colorScheme,
        model: thumbnail.model || MODELS[1].id,
        prompt: thumbnail.prompt || "",
        imageFile: null,
      });
      // LOGIC: Set the RIGHT panel image to the backend URL
      setResultImageUrl(thumbnail.imageUrl);
      // LOGIC: Reset the LEFT panel user preview
      setUserUploadPreview(null);
    }
  }, [id]);

  useEffect(() => {
    fetchGeneratedThumbnail();
  }, [id, fetchGeneratedThumbnail]);

  return (
    <div className="relative min-h-screen text-zinc-200 selection:bg-pink-500/30">
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
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  maxLength={100}
                  placeholder="e.g., 10 Tips for Better Sleep"
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 outline-none transition-all"
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
                      onClick={() => handleInputChange("aspect", r)}
                      className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all
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
                <label className="text-sm font-medium text-zinc-300">Style</label>
                <button 
                  type="button"
                  onClick={() => { setStyleOpen(!styleOpen); setModelOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl bg-black/40 border transition-all
                    ${styleOpen ? "border-pink-500" : "border-white/10 hover:border-white/20"}`}
                >
                  <div className="flex items-center gap-3">
                    {(() => {
                      const s = STYLES.find(i => i.id === formData.style) || STYLES[2];
                      return <><s.icon className="size-4 text-pink-500" /><span className="text-sm font-medium">{s.label}</span></>;
                    })()}
                  </div>
                  <ChevronDown className={`size-4 transition-transform ${styleOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {styleOpen && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute z-50 w-full mt-2 bg-[#0f0f0f] border border-white/10 rounded-xl overflow-hidden shadow-2xl backdrop-blur-3xl">
                      {STYLES.map((s) => (
                        <button key={s.id} type="button" onClick={() => { handleInputChange("style", s.id); setStyleOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-left transition-colors">
                          <s.icon className={`size-4 ${formData.style === s.id ? "text-pink-500" : "text-zinc-500"}`} />
                          <div><p className={`text-sm ${formData.style === s.id ? "text-white" : "text-zinc-400"}`}>{s.label}</p></div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Color Scheme Grid */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-zinc-300">Color Scheme</label>
                <div className="grid grid-cols-4 gap-2">
                  {COLOR_SCHEMES.map((scheme) => (
                    <button
                      key={scheme.id}
                      type="button"
                      onClick={() => handleInputChange("colorScheme", scheme.id)}
                      className={`h-8 rounded-lg overflow-hidden border-2 transition-all 
                        ${formData.colorScheme === scheme.id ? "border-pink-500 scale-105" : "border-transparent opacity-60 hover:opacity-100"}`}
                    >
                      <div className="flex h-full w-full">
                        {scheme.colors.map((c, i) => (<div key={i} className="flex-1" style={{ backgroundColor: c }} />))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Model Selection */}
              <div className="relative space-y-2">
                <label className="text-sm font-medium text-zinc-400">AI Model</label>
                <button
                  type="button"
                  onClick={() => { setModelOpen(!modelOpen); setStyleOpen(false); }}
                  className={`w-full px-4 py-3 rounded-xl bg-black/40 border transition-all flex justify-between items-center ${modelOpen ? "border-pink-500" : "border-white/10"}`}
                >
                  <span className="text-sm font-medium text-white">{MODELS.find(m => m.id === formData.model)?.label}</span>
                  <ChevronDown className={`size-4 transition-transform ${modelOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {modelOpen && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute z-50 w-full mt-2 bg-[#0f0f0f] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                      {MODELS.map((m) => (
                        <button key={m.id} type="button" onClick={() => { handleInputChange("model", m.id); setModelOpen(false); }} className="w-full px-4 py-3 flex justify-between items-center hover:bg-white/5">
                          <span className={`text-sm ${formData.model === m.id ? "text-pink-500" : "text-zinc-400"}`}>{m.label} ({m.credits} credits)</span>
                          {formData.model === m.id && <Check className="size-4 text-pink-500" />}
                        </button>
                      ))}
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

              {/* Additional Prompt */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Extra Details</label>
                <textarea
                  rows={3}
                  value={formData.prompt}
                  onChange={(e) => handleInputChange("prompt", e.target.value)}
                  placeholder="Lighting, mood, specific elements..."
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-pink-500 outline-none resize-none text-sm"
                />
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
    </div>
  );
};

export default GeneratePage;