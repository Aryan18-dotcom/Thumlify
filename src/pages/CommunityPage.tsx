import { useEffect, useState, useMemo, useCallback, memo } from "react";
import SoftBackDrop from "../components/SoftBackDrop";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  UserIcon, Search, X, LayoutGrid, Sparkles, TrendingUp, Coins, Loader2, Layers, Download
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const serverUrl = import.meta.env.VITE_SERVER_API_URI;

const CREDIT_COSTS: Record<string, number> = {
  'PNG': 0, 'JPG': 10, 'WEBP': 12, 'PDF': 15
};

// --- OPTIMIZED DETAIL MODAL ---
const DetailModal = memo(({ thumb_id, onClose, onDownload }: { thumb_id: string, onClose: () => void, onDownload: any }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingFormat, setDownloadingFormat] = useState("");
  console.log(thumb_id);


  useEffect(() => {
    const controller = new AbortController();

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${serverUrl}/api/community/rank/${thumb_id}`, {
          credentials: 'include',
          signal: controller.signal
        });
        const result = await res.json();

        if (result._id || result.success) {
          setData(result);
          console.log(result);
          
        } else {
          toast.error("Asset not found");
          onClose();
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error(err);
          toast.error("Failed to load details");
          onClose();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
    return () => controller.abort();
  }, [thumb_id]); // Only re-run if ID changes, NOT on onClose/onDownload change

  const handleAction = async (format: string) => {
    if (!data) return;
    setDownloadingFormat(format);
    try {
      await onDownload(format, data.thumbnailId.imageUrl, data.thumbnailId.title);
    } finally {
      setDownloadingFormat("");
    }
  };

  if (loading) return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-md bg-black/60">
      <Loader2 className="text-pink-500 animate-spin" size={40} />
    </div>
  );

  if (!data) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-black/40 animate-in fade-in duration-300">
      {/* Click overlay to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-5xl bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-6 right-6 z-50 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all hover:rotate-90">
          <X size={20} />
        </button>

        {/* Left: Image Preview */}
        <div className="w-full md:w-3/5 bg-neutral-900 flex items-center justify-center p-4">
          <img src={data.thumbnailId?.imageUrl} className="w-full h-full object-contain rounded-xl shadow-2xl" alt="Preview" />
        </div>

        {/* Right: Info & Actions */}
        <div className="w-full md:w-2/5 p-8 overflow-y-auto custom-scrollbar flex flex-col">
          <div className="flex gap-2 mb-6">
            <span className="px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-500 text-[10px] font-black uppercase tracking-widest">Premium</span>
            <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase tracking-widest">{data.thumbnailId?.style}</span>
          </div>

          <h2 className="text-2xl font-black text-white uppercase mb-1">{data.thumbnailId?.title}</h2>
          <p className="text-neutral-500 text-xs mb-8 uppercase font-bold tracking-tighter">By <span className="text-pink-500">{data.userId?.username || "Creator"}</span></p>

          {/* Stats section */}
          <div className="space-y-4 mb-8">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">AI Market Potential</span>
                <span className="text-white font-black">{data.valuationByLLM}/10</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-pink-500 transition-all duration-1000" style={{ width: `${(data.valuationByLLM || 0) * 10}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <TrendingUp size={14} className="text-green-500 mb-2" />
                <p className="text-[9px] text-neutral-500 uppercase font-bold">Downloads</p>
                <p className="text-lg font-black text-white">{data.downloadCount || 0}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <Layers size={14} className="text-blue-500 mb-2" />
                <p className="text-[9px] text-neutral-500 uppercase font-bold">Ratio</p>
                <p className="text-lg font-black text-white">{data.thumbnailId?.aspect_ratio || "1:1"}</p>
              </div>
            </div>
          </div>

          {/* Download Grid */}
          <div className="mt-auto pt-6 border-t border-white/10">
            <p className="text-[10px] font-black text-zinc-500 uppercase mb-4 tracking-widest">Select Export Format</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(CREDIT_COSTS).map(([format, cost]) => (
                <button
                  key={format}
                  disabled={!!downloadingFormat}
                  onClick={() => handleAction(format)}
                  className="group relative flex flex-col items-center p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-pink-600/10 hover:border-pink-500/40 transition-all disabled:opacity-50"
                >
                  {downloadingFormat === format ? <Loader2 className="animate-spin text-pink-500" size={18} /> : (
                    <>
                      <span className="text-sm font-black text-white">{format}</span>
                      <span className={`text-[9px] font-bold ${cost > 0 ? 'text-yellow-500' : 'text-green-500'}`}>{cost} Credits</span>
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// --- OPTIMIZED GRID ITEM ---
const ListingItem = memo(({ item, onClick }: any) => {
  const thumb = item.thumbnailId;
  return (
    <div
      onClick={() => onClick(item._id)}
      className="group relative rounded-2xl bg-[#111] border border-white/5 hover:border-pink-500/50 transition-all duration-300 overflow-hidden mb-6 break-inside-avoid"
    >
      <div className="absolute top-3 left-3 z-10 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
        <Coins size={10} className="text-yellow-500" />
        <span className="text-[10px] font-black text-white">{item.totalPrice}</span>
      </div>
      <img src={thumb.imageUrl} className="w-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
      <div className="p-4 bg-gradient-to-b from-transparent to-black/80">
        <h3 className="text-white text-sm font-bold truncate uppercase tracking-tighter">{thumb.title}</h3>
        <div className="flex justify-between items-center mt-2">
          <span className="text-[9px] text-zinc-500 font-bold uppercase">{thumb.style}</span>
          <Download size={12} className="text-zinc-500 group-hover:text-pink-500 transition-colors" />
        </div>
      </div>
    </div>
  );
});

const CommunityPage = () => {
  const { user, fetchCredits } = useAuth();
  const [allData, setAllData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        const response = await fetch(`${serverUrl}/api/community`, { credentials: 'include' });
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
    const searchStr = searchQuery.toLowerCase();
    const filtered = allData.filter(item =>
      item.thumbnailId?.title?.toLowerCase().includes(searchStr) ||
      item.thumbnailId?.style?.toLowerCase().includes(searchStr)
    );

    // FIX: Compare with item.userId, not item._id
    return {
      myListings: filtered.filter(item => item.userId === user?._id || item.userId?._id === user?._id),
      otherListings: filtered.filter(item => item.userId !== user?._id && item.userId?._id !== user?._id)
    };
  }, [allData, searchQuery, user]);

  const handleDownloadRequest = useCallback(async (format: string, imageUrl: string, title: string) => {
    if (!user) {
      toast.error("Please login to download");
      return navigate('/login');
    }

    const cost = CREDIT_COSTS[format];
    try {
      if (cost > 0) {
        const creditRes = await fetch(`${serverUrl}/api/credits/deduct-credits`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: cost })
        });

        if (!creditRes.ok) throw new Error("Insufficient credits");
        await fetchCredits();
      }

      const imageResponse = await fetch(imageUrl);
      const blob = await imageResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.replace(/\s+/g, '_')}.${format.toLowerCase()}`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success(`${format} Downloaded!`);
    } catch (error: any) {
      toast.error(error.message || "Download failed");
    }
  }, [user, navigate, fetchCredits]);

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <SoftBackDrop />
      {selectedId && <DetailModal thumb_id={selectedId} onClose={() => setSelectedId(null)} onDownload={handleDownloadRequest} />}

      <div className="mt-32 max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-black italic tracking-tighter uppercase">Showroom</h1>
            <p className="text-zinc-500 font-bold text-sm tracking-widest uppercase flex items-center gap-2">
              <Sparkles size={14} className="text-pink-500" /> Discover & Earn Credits
            </p>
          </div>

          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-pink-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search styles, titles..."
              className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:border-pink-500/50 transition-all"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="columns-1 md:columns-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-64 bg-zinc-900 animate-pulse rounded-2xl mb-6" />)}
          </div>
        ) : (
          <div className="space-y-16">
            {myListings.length > 0 && (
              <section>
                <h2 className="text-xs font-black uppercase text-zinc-500 tracking-[0.3em] mb-6 flex items-center gap-2">
                  <UserIcon size={14} /> Your Portfolio
                </h2>
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
                  {myListings.map(item => <ListingItem key={item._id} item={item} onClick={setSelectedId} />)}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-xs font-black uppercase text-zinc-500 tracking-[0.3em] mb-6 flex items-center gap-2">
                <LayoutGrid size={14} /> Global Discovery
              </h2>
              {otherListings.length > 0 ? (
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
                  {otherListings.map(item => <ListingItem key={item._id} item={item} onClick={setSelectedId} />)}
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center border border-dashed border-white/10 rounded-3xl text-zinc-600 font-bold uppercase text-xs tracking-widest">
                  No results found
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityPage;