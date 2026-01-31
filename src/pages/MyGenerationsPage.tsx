import { useEffect, useState, useMemo } from "react";
import SoftBackDrop from "../components/SoftBackDrop";
import { type IThumbnail } from "../assets";
import { Link, useNavigate } from "react-router-dom";
import { 
    ArrowUpRightIcon, DownloadIcon, TrashIcon, Search, X, 
    Loader2, Coins, Palette, 
    Layers, Clock, 
    MonitorPlayIcon
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const CREDIT_COSTS: Record<string, number> = {
    'PNG': 0,
    'JPG': 10,
    'WEBP': 12,
    'PDF': 15
};

const MyGenerationsPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading: authLoading, fetchCredits } = useAuth();

    const aspectRatioClassMap: Record<string, string> = {
        '16:9': 'aspect-video',
        '1:1': 'aspect-square',
        '9:16': 'aspect-[9/16]',
    };

    const [thumbnails, setThumbnails] = useState<IThumbnail[]>([]);
    const [fetching, setFetching] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedThumb, setSelectedThumb] = useState<IThumbnail | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const serverUrl = import.meta.env.VITE_SERVER_API_URI;

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            toast.error("Please login to view your gallery");
            navigate("/login");
        }
    }, [isAuthenticated, authLoading, navigate]);

    const fetchThumbnails = async () => {
        setFetching(true);
        try {
            const response = await fetch(`${serverUrl}/api/thumbnail/get-user-thumnails`, {
                method: 'GET',
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setThumbnails(data.data || []);
            }
        } catch (error) {
            toast.error("Could not load gallery.");
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) fetchThumbnails();
    }, [isAuthenticated]);

    const handleDownloadRequest = async (format: string) => {
        if (!selectedThumb) return;
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
                    const creditData = await creditRes.json();
                    toast.error(creditData.message || "Insufficient credits.");
                    setIsDownloading(false);
                    return;
                }
                await fetchCredits(); 
            }

            const fileName = `${selectedThumb.title.replace(/\s+/g, '_')}_${format}.${format.toLowerCase()}`;
            const imageResponse = await fetch(selectedThumb.imageUrl as string);
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
            setSelectedThumb(null);
        } catch (error) {
            toast.error("Download failed.");
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDeleteThumbnail = async (thumbnailId: string) => {
        try {
            const response = await fetch(`${serverUrl}/api/thumbnail/delete/${thumbnailId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete thumbnail');
            }

            toast.success('Thumbnail deleted successfully!');
            setThumbnails(prev => prev.filter(thumb => thumb._id !== thumbnailId));
            setSelectedThumb(null);
        } catch (error: any) {
            console.error('Delete error:', error);
            toast.error(error.message || 'Failed to delete thumbnail');
        }
    };

    const filteredThumbnails = useMemo(() => {
        return thumbnails.filter((thumb) => {
            const query = searchQuery.toLowerCase();
            return (thumb.title?.toLowerCase().includes(query) || thumb.style?.toLowerCase().includes(query));
        });
    }, [searchQuery, thumbnails]);

    if (authLoading || (fetching && thumbnails.length === 0)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950">
                <Loader2 className="animate-spin text-pink-500" size={40} />
            </div>
        );
    }

    return (
        <>
            <SoftBackDrop />
            <div className="mt-28 min-h-screen px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 pb-20">
                {/* Header Area */}
                <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Gallery</h1>
                        <p className="text-zinc-500 text-sm mt-1">Manage and export your AI-generated assets.</p>
                    </div>
                    <div className="relative group max-w-md w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-500 group-focus-within:text-pink-500 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Search by title or style..." 
                            value={searchQuery} 
                            onChange={(e) => setSearchQuery(e.target.value)} 
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-6 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500/40 transition-all" 
                        />
                    </div>
                </div>

                {/* Main Grid */}
                {filteredThumbnails.length > 0 ? (
                    <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                        {filteredThumbnails.map((thumbnail) => (
                            <div key={thumbnail._id} className="break-inside-avoid group relative rounded-3xl bg-zinc-900/40 border border-white/5 overflow-hidden hover:border-pink-500/30 transition-all duration-500 shadow-2xl">
                                <div className={`w-full bg-zinc-800 ${aspectRatioClassMap[thumbnail.aspect_ratio as string] || 'aspect-video'} overflow-hidden relative`}>
                                    <img src={thumbnail.imageUrl} alt={thumbnail.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    
                                    {/* Action Buttons Overlay */}
                                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                        <div className="flex gap-2">
                                            <button onClick={() => setSelectedThumb(thumbnail)} className="p-3 bg-white text-black rounded-xl hover:bg-pink-500 hover:text-white transition-colors shadow-xl">
                                                <DownloadIcon size={18} />
                                            </button>
                                            <a href={`/youtube-preview?thumbnail_url=${thumbnail.imageUrl}&title=${thumbnail.title}`}   target="_blank" className="p-3 bg-zinc-900/80 backdrop-blur-md text-white rounded-xl hover:bg-zinc-800 transition-colors border border-white/10">
                                                <MonitorPlayIcon size={18} />
                                            </a>
                                            <Link to={`/my-thumbnial-dets/${thumbnail._id}`} className="p-3 bg-zinc-900/80 backdrop-blur-md text-white rounded-xl hover:bg-zinc-800 transition-colors border border-white/10">
                                                <ArrowUpRightIcon size={18} />
                                            </Link>
                                        </div>
                                        <button onClick={() => handleDeleteThumbnail(thumbnail._id)} className="p-3 bg-red-500/20 backdrop-blur-md text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20">
                                            <TrashIcon size={18} />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="text-white font-bold text-base truncate mb-1">{thumbnail.title}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-pink-500 uppercase tracking-widest px-2 py-0.5 bg-pink-500/10 rounded-md">{thumbnail.style}</span>
                                        <span className="text-[10px] font-bold text-pink-500 uppercase tracking-widest px-2 py-0.5 bg-pink-500/10 rounded-md">{thumbnail.aspect_ratio}</span>
                                        <span className="text-[10px] font-bold text-pink-500 uppercase tracking-widest px-2 py-0.5 bg-pink-500/10 rounded-md">{thumbnail.color_scheme}</span>
                                    </div>
                                    <p className="text-neutral-400 text-xs mt-2">{ thumbnail.text_overlay }</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-40 border border-dashed border-white/10 rounded-[40px] bg-white/[0.02]">
                        <div className="p-6 bg-white/5 rounded-full mb-4">
                            <Search size={40} className="text-zinc-700" />
                        </div>
                        <h3 className="text-white text-xl font-bold">No assets found</h3>
                        <p className="text-zinc-500">Try adjusting your search filters.</p>
                    </div>
                )}

                {/* Modernized Responsive Modal */}
                {selectedThumb && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-6 overflow-y-auto">
                        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl" onClick={() => !isDownloading && setSelectedThumb(null)} />
                        
                        <div className="relative w-full max-w-5xl bg-zinc-950 sm:border sm:border-white/10 sm:rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                            {/* Close Button */}
                            <button 
                                onClick={() => setSelectedThumb(null)} 
                                disabled={isDownloading} 
                                className="absolute top-6 right-6 p-3 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full z-[110] transition-all disabled:opacity-0"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex flex-col lg:flex-row h-full max-h-[90vh] overflow-y-auto lg:overflow-hidden">
                                
                                {/* Image Preview Section */}
                                <div className="w-full lg:w-[55%] p-6 sm:p-10 lg:p-12 bg-zinc-900/30 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-white/5">
                                    <div className="relative group w-full shadow-2xl">
                                        <img 
                                            src={selectedThumb.imageUrl} 
                                            alt="Full Preview" 
                                            className="w-full h-auto rounded-2xl sm:rounded-[24px] object-contain ring-1 ring-white/10" 
                                        />
                                        <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[10px] text-zinc-300 font-bold tracking-tighter uppercase">
                                            High Res Preview
                                        </div>
                                    </div>
                                </div>

                                {/* Content & Details Section */}
                                <div className="w-full lg:w-[45%] p-8 sm:p-10 lg:p-12 flex flex-col overflow-y-auto">
                                    <div className="mb-8">
                                        <h2 className="text-3xl font-black text-white mb-2 leading-tight">{selectedThumb.title}</h2>
                                        <p className="text-zinc-400 text-sm">Download your generation in various high-fidelity formats.</p>
                                    </div>

                                    {/* Detailed Metadata Grid */}
                                    <div className="grid grid-cols-2 gap-3 mb-10">
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-pink-500 mb-1">
                                                <Palette size={14} />
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Color Palette</span>
                                            </div>
                                            <span className="text-sm text-white font-medium capitalize">{selectedThumb.color_scheme || 'Natural'}</span>
                                        </div>
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-blue-500 mb-1">
                                                <Layers size={14} />
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Aspect Ratio</span>
                                            </div>
                                            <span className="text-sm text-white font-medium">{selectedThumb.aspect_ratio}</span>
                                        </div>
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-green-500 mb-1">
                                                <Clock size={14} />
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Generated On</span>
                                            </div>
                                            <span className="text-sm text-white font-medium">{new Date(selectedThumb.createdAt || Date.now()).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    {/* Export Formats */}
                                    <div className="mt-auto">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Select Format</h4>
                                            <div className="h-[1px] flex-1 bg-white/5 ml-4"></div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3">
                                            {Object.entries(CREDIT_COSTS).map(([format, cost]) => (
                                                <button
                                                    key={format}
                                                    disabled={isDownloading}
                                                    onClick={() => handleDownloadRequest(format)}
                                                    className="group flex flex-col items-center justify-center p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-pink-600/10 hover:border-pink-500/50 transition-all active:scale-95 disabled:opacity-50"
                                                >
                                                    <span className="text-lg font-black text-white group-hover:text-pink-500 transition-colors">{format}</span>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <Coins size={10} className={cost > 0 ? "text-yellow-500" : "text-green-500"} />
                                                        <span className={`text-[9px] font-bold ${cost > 0 ? "text-yellow-500" : "text-green-500"}`}>
                                                            {cost === 0 ? "FREE" : `${cost}`}
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>

                                        {isDownloading && (
                                            <div className="mt-6 flex items-center justify-center gap-3 py-4 bg-pink-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-pink-500/20 animate-pulse">
                                                <Loader2 className="animate-spin" size={20} />
                                                GENERATING EXPORT...
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default MyGenerationsPage;