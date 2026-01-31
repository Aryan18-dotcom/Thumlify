import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Layers, Palette, Layout, ArrowLeft, 
    Download, Trash2, Share2, Coins, Loader2, Sparkles, User as UserIcon, X,
    TrendingUp, ShieldCheck, Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from "../context/AuthContext";

// --- INTERFACES ---
interface ThumbnailData {
    _id: string;
    title: string;
    description?: string;
    imageUrl: string;
    style: string;
    aspect_ratio: string;
    color_scheme: string;
    prompt_used: string;
    enhanced_prompt?: string;
    createdAt: string;
}

interface CommunityData {
    _id: string;
    userId: string;
    thumbnailId: string; // This is the ID used to fetch ThumbnailData
    valuationByLLM: number;
    totalPrice: number;
    creatorEarnings: number;
    platformFee: number;
    downloadCount: number;
    status: string;
    reasoning?: string;
}

const CREDIT_COSTS: Record<string, number> = { 'PNG': 0, 'JPG': 10, 'WEBP': 12, 'PDF': 15 };

const ThumbnialDetsPage = () => {
    const { thumb_id } = useParams(); // This is the Community Listing ID
    const navigate = useNavigate();
    const { fetchCredits } = useAuth();
    
    const [thumbnailData, setThumbnailData] = useState<ThumbnailData | null>(null);
    const [communityInfo, setCommunityInfo] = useState<CommunityData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [showDownloadModal, setShowDownloadModal] = useState(false);

    const serverUrl = import.meta.env.VITE_SERVER_API_URI;

    // --- DATA FETCHING LOGIC ---
    const fetchAllDetails = async (signal: AbortSignal) => {
        try {
            setLoading(true);
            
            // 1. Fetch Community Ranking Info
            const communityRes = await fetch(`${serverUrl}/api/community/rank/${thumb_id}`, { 
                credentials: 'include',
                signal 
            });
            
            if (!communityRes.ok) {
                throw new Error("Failed to fetch community data");
            }
            
            const communityResult: CommunityData = await communityRes.json();
            setCommunityInfo(communityResult);

            // 2. Fetch Actual Thumbnail Content using the ID from the first result
            // Endpoint: /api/generate/:thumbnailId
            const thumbRes = await fetch(`${serverUrl}/api/generate/${communityResult.thumbnailId}`, { 
                credentials: 'include',
                signal 
            });

            const thumbResult = await thumbRes.json();
            
            if (thumbRes.ok) {
                // Handle both wrapped {data: ...} and direct object responses
                setThumbnailData(thumbResult.data || thumbResult);
            } else {
                toast.error("Thumbnail assets could not be retrieved");
            }

        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error("Fetch Error:", error);
                toast.error("Error loading design details");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        if (thumb_id) fetchAllDetails(controller.signal);
        
        return () => controller.abort();
    }, [thumb_id]);

    // --- HANDLERS ---
    const handleDownloadRequest = async (format: string) => {
        if (!thumbnailData) return;
        setIsDownloading(true);
        const cost = CREDIT_COSTS[format];
        try {
            if (cost > 0) {
                const creditRes = await fetch(`${serverUrl}/api/credits/deduct-credits`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: cost })
                });
                if (!creditRes.ok) {
                    toast.error("Insufficient credits.");
                    return;
                }
                await fetchCredits(); 
            }

            const fileName = `${thumbnailData.title.replace(/\s+/g, '_')}.${format.toLowerCase()}`;
            const imageResponse = await fetch(thumbnailData.imageUrl);
            const blob = await imageResponse.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl; 
            link.download = fileName;
            document.body.appendChild(link); 
            link.click(); 
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
            
            toast.success(`${format} exported!`);
            setShowDownloadModal(false);
        } catch (error) { 
            toast.error("Download failed."); 
        } finally { 
            setIsDownloading(false); 
        }
    };

    const getAspectRatioClass = (ratio: string) => {
        switch (ratio) {
            case "16:9": return "aspect-video";
            case "9:16": return "aspect-[9/16] h-[500px] md:h-[700px]";
            case "1:1": return "aspect-square max-w-2xl";
            default: return "aspect-video";
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <Loader2 className="animate-spin text-pink-500" size={40} />
        </div>
    );

    if (!thumbnailData || !communityInfo) return (
        <div className="min-h-screen flex flex-col items-center justify-center text-white gap-4">
            <Info className="text-zinc-500" size={48} />
            <p className="text-xl font-bold">Design listing not found.</p>
            <button onClick={() => navigate(-1)} className="text-pink-500 hover:underline">Go Back</button>
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white p-4 sm:p-8 lg:p-12 pt-24">
            <div className="max-w-7xl mx-auto">
                
                {/* Header Navigation */}
                <div className="flex justify-between items-center mt-12 mb-8">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-all bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                        <ArrowLeft size={18} /> Back to Showroom
                    </button>
                    <div className="flex gap-2">
                        <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10"><Share2 size={20} /></button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Left Side: Preview & Metadata */}
                    <div className="flex-1 space-y-8">
                        <div className={`relative overflow-hidden rounded-[32px] border border-white/10 shadow-2xl bg-zinc-900 group ${getAspectRatioClass(thumbnailData.aspect_ratio)} mx-auto`}>
                            <img src={thumbnailData.imageUrl} alt={thumbnailData.title} className="w-full h-full object-contain" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                                <button onClick={() => setShowDownloadModal(true)} className="flex items-center gap-2 bg-pink-600 hover:bg-pink-500 text-white px-8 py-4 rounded-2xl font-black shadow-2xl active:scale-95 transition-all">
                                    <Download size={20} /> Export Design
                                </button>
                            </div>
                        </div>

                        <div>
                            <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight uppercase italic">{thumbnailData.title}</h1>
                            <p className="text-zinc-400 text-lg leading-relaxed">{thumbnailData.description || "No additional description provided."}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white/5 border border-white/10 rounded-[24px] p-6">
                                <div className="flex items-center gap-2 text-zinc-400 mb-3 text-xs font-bold uppercase tracking-widest"><UserIcon size={14} /> Source Prompt</div>
                                <p className="text-zinc-300 italic text-sm">"{thumbnailData.prompt_used}"</p>
                            </div>
                            <div className="bg-pink-500/5 border border-pink-500/20 rounded-[24px] p-6 relative overflow-hidden">
                                <Sparkles className="absolute -right-2 -top-2 text-pink-500/10" size={80} />
                                <div className="flex items-center gap-2 text-pink-500 mb-3 text-xs font-bold uppercase tracking-widest relative z-10"><Sparkles size={14} /> AI Optimization</div>
                                <p className="text-zinc-200 text-sm relative z-10">{thumbnailData.enhanced_prompt || "Original prompt used."}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Market Stats */}
                    <div className="w-full lg:w-96 space-y-6">
                        <div className="bg-zinc-900/50 border border-white/10 rounded-[32px] p-8 space-y-6 backdrop-blur-sm">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-xl">Market Analysis</h3>
                                    <div className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-green-500/20">Listed</div>
                                </div>
                                
                                <div className="bg-black/40 border border-white/5 rounded-2xl p-6 text-center">
                                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2">Market Potential Score</p>
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-6xl font-black text-white">{communityInfo.valuationByLLM}</span>
                                        <span className="text-zinc-500 font-bold text-xl">/10</span>
                                    </div>
                                    <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-pink-500" style={{ width: `${communityInfo.valuationByLLM * 10}%` }} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Export Price</p>
                                        <div className="flex items-center gap-2 font-black text-xl text-yellow-500">
                                            <Coins size={16} /> {communityInfo.totalPrice}
                                        </div>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Creator Share</p>
                                        <div className="flex items-center gap-2 font-black text-xl text-green-500">
                                            <ShieldCheck size={16} /> {communityInfo.creatorEarnings}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-pink-500/5 border border-pink-500/10 rounded-2xl p-4">
                                    <p className="text-[10px] text-pink-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-2"><TrendingUp size={12}/> Performance Logic</p>
                                    <p className="text-sm text-zinc-300 leading-relaxed italic">"{communityInfo.reasoning || "Highly engaging color palette with strong visual hierarchy."}"</p>
                                </div>
                            </div>
                        </div>

                        {/* Technical Specs */}
                        <div className="bg-zinc-900/50 border border-white/10 rounded-[32px] p-8 space-y-6">
                            <h3 className="font-bold text-xl">Technical Properties</h3>
                            <div className="space-y-4">
                                {[
                                    { icon: Layout, label: "Aspect Ratio", val: thumbnailData.aspect_ratio, color: "text-pink-500", bg: "bg-pink-500/10" },
                                    { icon: Palette, label: "Color Profile", val: thumbnailData.color_scheme, color: "text-purple-500", bg: "bg-purple-500/10" },
                                    { icon: Layers, label: "Visual Style", val: thumbnailData.style, color: "text-blue-500", bg: "bg-blue-500/10" }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <div className={`p-3 ${item.bg} ${item.color} rounded-xl`}><item.icon size={18} /></div>
                                        <div>
                                            <p className="text-[10px] uppercase font-black tracking-widest text-zinc-500">{item.label}</p>
                                            <p className="font-bold text-sm capitalize">{item.val}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Export Modal */}
            {showDownloadModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/90 backdrop-blur-md" onClick={() => !isDownloading && setShowDownloadModal(false)} />
                    <div className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <button onClick={() => setShowDownloadModal(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white"><X size={20} /></button>
                        <h2 className="text-2xl font-black mb-2">Export Design</h2>
                        <p className="text-zinc-400 text-sm mb-8">Choose format. Costs are deducted from your balance.</p>
                        <div className="grid grid-cols-2 gap-3">
                            {Object.entries(CREDIT_COSTS).map(([format, cost]) => (
                                <button key={format} disabled={isDownloading} onClick={() => handleDownloadRequest(format)} className="flex flex-col items-center p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-pink-500/50 hover:bg-pink-500/5 transition-all group disabled:opacity-50">
                                    {isDownloading ? <Loader2 className="animate-spin text-zinc-500" size={20} /> : (
                                        <>
                                            <span className="text-lg font-black group-hover:text-pink-500">{format}</span>
                                            <div className="flex items-center gap-1 mt-1 text-[10px] font-black uppercase">
                                                <Coins size={10} className={cost > 0 ? "text-yellow-500" : "text-green-500"} />
                                                <span className={cost > 0 ? "text-yellow-500" : "text-green-500"}>{cost === 0 ? "FREE" : `${cost}`}</span>
                                            </div>
                                        </>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThumbnialDetsPage;