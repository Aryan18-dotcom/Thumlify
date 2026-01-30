import { useEffect, useState, useMemo } from "react"
import SoftBackDrop from "../components/SoftBackDrop"
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { 
  UserIcon, 
  Palette, 
  Search, 
  X,
  LayoutGrid,
  Sparkles,
  Zap,
  ShieldCheck,
  TrendingUp,
  Coins,
  Loader2,
  Layers,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const serverUrl = import.meta.env.VITE_SERVER_API_URI;

const CREDIT_COSTS: Record<string, number> = {
    'PNG': 0,
    'JPG': 10,
    'WEBP': 12,
    'PDF': 15
};

// --- DETAILED MODAL COMPONENT ---
const DetailModal = ({ id, onClose, handleDownloadRequest }: { id: string, onClose: () => void, handleDownloadRequest: any }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`${serverUrl}/api/community/${id}`, { credentials: 'include' });
        const result = await res.json();
        if (result.success) setData(result.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (!data && !loading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 backdrop-blur-xl bg-black/40">
      <div 
        className="absolute inset-0" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-5xl bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
        <button onClick={onClose} className="absolute top-6 right-6 z-50 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors">
          <X size={20} />
        </button>

        {loading ? (
          <div className="w-full h-[400px] flex items-center justify-center">
             <div className="size-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Left: Visuals */}
            <div className="w-full md:w-3/5 bg-neutral-900 flex flex-col items-center justify-center relative group">
                <img src={data.thumbnailId.imageUrl} className="w-full h-full object-contain" alt="Masterpiece" />
            </div>

            {/* Right: Data & AI Logic */}
            <div className="w-full md:w-2/5 p-8 md:p-10 overflow-y-auto custom-scrollbar">
               <div className="flex items-center gap-2 mb-6">
                  <div className="px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-500 text-[10px] font-black uppercase tracking-widest">
                     Premium Asset
                  </div>
                  <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase tracking-widest">
                     {data.thumbnailId.style}
                  </div>
               </div>

               <h2 className="text-3xl font-black text-white leading-tight mb-2 uppercase">{data.thumbnailId.title}</h2>
               <p className="text-neutral-500 text-sm mb-8 leading-relaxed">Created by <span className="text-white font-bold">{data.username}</span></p>

               {/* AI INSIGHTS SECTION */}
               <div className="space-y-4 mb-10">
                  <div className="p-5 rounded-3xl bg-white/5 border border-white/5">
                     <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-neutral-400">
                           <Zap size={16} className="text-yellow-500" />
                           <span className="text-xs font-bold uppercase">AI Quality Score</span>
                        </div>
                        <span className="text-2xl font-black text-white">{data.valuationByLLM}/10</span>
                     </div>
                     <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-pink-500 to-violet-500" style={{ width: `${data.valuationByLLM * 10}%` }} />
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <TrendingUp size={16} className="text-green-500 mb-2" />
                        <p className="text-[10px] text-neutral-500 uppercase font-bold">Total Sales</p>
                        <p className="text-lg font-black text-white">{data.downloadCount}</p>
                     </div>
                     <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <ShieldCheck size={16} className="text-blue-500 mb-2" />
                        <p className="text-[10px] text-neutral-500 uppercase font-bold">License</p>
                        <p className="text-lg font-black text-white">Public</p>
                     </div>
                     <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-pink-500 mb-1">
                          <Palette size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Color Palette</span>
                        </div>
                        <span className="text-sm text-white font-medium capitalize">{data.thumbnailId.color_scheme || 'Natural'}</span>
                     </div>
                     <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-blue-500 mb-1">
                          <Layers size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Aspect Ratio</span>
                        </div>
                        <span className="text-sm text-white font-medium">{data.thumbnailId.aspect_ratio}</span>
                     </div>
                  </div>
               </div>

               {/* EXPORT FORMATS */}
               <div className="mt-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Select Format</h4>
                    <div className="h-[1px] flex-1 bg-white/5 ml-4"></div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 mb-6">
                    {Object.entries(CREDIT_COSTS).map(([format, cost]) => (
                      <button
                        key={format}
                        disabled={isDownloading}
                        onClick={() => handleDownloadRequest(format, data.thumbnailId.imageUrl, data.thumbnailId.title,)}
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
                    <div className="flex items-center justify-center gap-3 py-4 bg-pink-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-pink-500/20 animate-pulse">
                      <Loader2 className="animate-spin" size={20} />
                      GENERATING EXPORT...
                    </div>
                  )}
               </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}


const CommunityPage = () => {
  const { user, fetchCredits } = useAuth(); 
  const [allData, setAllData] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const nevigate = useNavigate()

  const aspectRatioClassMap: Record<string, string> = {
    '16:9': 'aspect-video',
    '1:1': 'aspect-square',
    '9:16': 'aspect-[9/16]',
  }

  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${serverUrl}/api/community`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', 
        });
        const result = await response.json();
        if (result.success) setAllData(result.data);
      } catch (error) {
        console.error("Fetch Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCommunityData();
  }, []);

  const { myListings, otherListings } = useMemo(() => {
    const filtered = allData.filter((item) => {
      const searchStr = searchQuery.toLowerCase();
      const thumb = item.thumbnailId;
      return thumb?.title?.toLowerCase().includes(searchStr) || thumb?.style?.toLowerCase().includes(searchStr);
    });
    
    return {
      myListings: filtered?.filter(item => item._id === user?._id),
      otherListings: filtered?.filter(item => item._id !== user?._id)
    };
  }, [allData, searchQuery, user]);

  const handleDownloadRequest = async (format: string, imageUrl: string, title: string) => {
    if (!user) {
      toast.error("Please login to download assets");
      return nevigate('/login');
    }

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

      const fileName = `${title.replace(/\s+/g, '_')}${format.toLowerCase()}`;
      const imageResponse = await fetch(imageUrl);
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
    } catch (error) {
      toast.error("Download failed.");
    } finally {
      // Maintain isDownloading state for 7 seconds (5-10 sec range)
      setTimeout(() => {
        setIsDownloading(false);
      }, 7000);
    }
  };

  const ListingGrid = ({ items, title, icon: Icon, isOwner }: any) => (
    <div className="mb-20">
      <div className="flex items-center gap-3 mb-8">
        <div className={`p-2 rounded-lg ${isOwner ? 'bg-pink-500/20 text-pink-500' : 'bg-white/5 text-neutral-400'}`}>
            <Icon size={20} />
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight uppercase">
            {title} <span className="ml-2 text-neutral-600">({items.length})</span>
        </h2>
      </div>
      
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        {items.map((item: any) => {
          const thumb = item.thumbnailId;
          const aspectClass = aspectRatioClassMap[thumb.aspect_ratio] || 'aspect-video';

          return (
            <div 
                key={item._id} 
                onClick={() => setSelectedId(item._id)} // OPEN MODAL ON CLICK
                className="cursor-pointer break-inside-avoid group relative rounded-2xl bg-[#161616] border border-white/5 hover:border-pink-500/40 transition-all duration-500 shadow-2xl overflow-hidden mb-6"
            >
              <div className="absolute top-4 left-4 z-30">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10">
                    <Sparkles size={12} className="text-pink-500" />
                    <span className="text-[11px] font-bold text-white">{item.totalPrice} Cr</span>
                </div>
              </div>

              <div className={`w-full bg-neutral-900 ${aspectClass} overflow-hidden relative`}>
                <img src={thumb.imageUrl} alt={thumb.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              <div className="p-6 border-t border-white/5">
                <h3 className="text-white text-lg font-bold truncate mb-4">{thumb.title}</h3>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-neutral-400">
                        <Palette size={14} className="text-pink-500/70" />
                        <span className="text-[10px] text-neutral-200 uppercase bg-white/5 px-2 py-0.5 rounded">{thumb.color_scheme}</span>
                    </div>
                    <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest">{thumb.style}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <SoftBackDrop />
      
      {/* Detail Modal Render */}
      {selectedId && (
        <DetailModal 
            id={selectedId} 
            onClose={() => setSelectedId(null)} 
            handleDownloadRequest={handleDownloadRequest}
        />
      )}

      <div className="mt-32 min-h-screen px-6 md:px-16 lg:px-24 xl:px-32 pb-20">
        {/* Header stays the same... */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <div className="border-l-4 border-pink-500 pl-6">
            <h1 className="text-4xl font-black text-white tracking-tight uppercase">Community Showroom</h1>
            <p className="mt-2 text-lg text-neutral-500 font-medium italic">Discover premium thumbnails and earn credits.</p>
          </div>
          <div className="relative w-full lg:w-96">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#161616] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none" />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-40">
            <div className="size-10 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {myListings.length > 0 && <ListingGrid items={myListings} title="Your Assets" icon={UserIcon} isOwner={true} />}
            {otherListings.length > 0 ? <ListingGrid items={otherListings} title="Global Showroom" icon={LayoutGrid} isOwner={false} /> : <p className="text-center text-neutral-500">Nothing to show yet.</p>}
          </>
        )}
      </div>
    </>
  )
}

export default CommunityPage;