import { useEffect, useState, useMemo } from "react"
import SoftBackDrop from "../components/SoftBackDrop"
import { dummyThumbnails, type IThumbnail } from "../assets"
import { Link } from "react-router-dom";
import { 
  ArrowUpRightIcon, 
  DownloadIcon, 
  UserIcon, 
  CalendarDays, 
  Palette, 
  Search, 
  X 
} from "lucide-react";

const CommunityPage = () => {
  const aspectRatioClassMap: Record<string, string> = {
    '16:9': 'aspect-video',
    '1:1': 'aspect-square',
    '9:16': 'aspect-[9/16]',
  }

  const [allThumbnails, setAllThumbnails] = useState<IThumbnail[]>([])
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [visibleCount, setVisibleCount] = useState<number>(6)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      setAllThumbnails(dummyThumbnails as unknown as IThumbnail[])
      setIsLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  // SEARCH LOGIC: Filter by Title, Author, Color, or Style
  const filteredThumbnails = useMemo(() => {
    return allThumbnails.filter((thumb) => {
      const searchStr = searchQuery.toLowerCase();
      return (
        thumb.title.toLowerCase().includes(searchStr) ||
        /* @ts-ignore */
        (thumb.author || "").toLowerCase().includes(searchStr) ||
        thumb.colorScheme.toLowerCase().includes(searchStr) ||
        thumb.style.toLowerCase().includes(searchStr)
      );
    });
  }, [searchQuery, allThumbnails]);

  const paginatedThumbnails = filteredThumbnails.slice(0, visibleCount);

  const handleDownload = (image_url: string) => {
    const link = document.createElement("a");
    link.href = image_url;
    link.download = "thumlify-community.png";
    link.click();
  }

  return (
    <>
      <SoftBackDrop />
      <div className="mt-32 min-h-screen px-6 md:px-16 lg:px-24 xl:px-32">
        
        {/* Header & Search Bar */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div className="border-l-4 border-pink-500 pl-6">
            <h1 className="text-4xl font-black text-white tracking-tight uppercase">Community Showroom</h1>
            <p className="mt-2 text-lg text-neutral-500 font-medium">Search and discover magic from fellow designers.</p>
          </div>

          <div className="relative w-full lg:w-96 group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search size={18} className="text-neutral-500 group-focus-within:text-pink-500 transition-colors" />
            </div>
            <input 
              type="text"
              placeholder="Search title, user, color, or style..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(6); // Reset pagination on search
              }}
              className="w-full bg-[#161616] border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all shadow-2xl"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-4 flex items-center text-neutral-500 hover:text-white"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="rounded-2xl bg-white/5 border border-white/10 animate-pulse h-72 w-full break-inside-avoid"></div>
            ))}
          </div>
        )}

        {/* Empty Search Results */}
        {!isLoading && filteredThumbnails.length === 0 && (
          <div className="text-center py-32 bg-[#161616] rounded-3xl border border-dashed border-white/10">
            <Search size={48} className="mx-auto text-neutral-700 mb-4" />
            <h3 className="text-xl font-bold text-white">No magic found</h3>
            <p className="text-neutral-500 mt-2">Try searching for different keywords like "Retro", "Blue", or "Gaming"</p>
          </div>
        )}

        {/* Community Grid */}
        {!isLoading && filteredThumbnails.length > 0 && (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {paginatedThumbnails.map((thumbnail: IThumbnail) => {
              const aspectClass = aspectRatioClassMap[thumbnail.aspect] || 'aspect-video';

              return (
                <div 
                  key={thumbnail._id} 
                  className="break-inside-avoid group relative rounded-2xl bg-[#161616] border border-white/5 hover:border-pink-500/40 transition-all duration-500 shadow-2xl overflow-hidden mb-6"
                >
                  {/* USERNAME HIGHLIGHT */}
                  <div className="absolute top-4 left-4 z-30 transition-transform duration-300 group-hover:-translate-y-1">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-pink-600 to-violet-600 shadow-lg shadow-pink-900/40 ring-1 ring-white/20">
                        <UserIcon className="size-3 text-white" />
                        <span className="text-[11px] font-black text-white uppercase tracking-wider">
                            {/* @ts-ignore */}
                            {thumbnail.author || "Global Creator"}
                        </span>
                    </div>
                  </div>

                  {/* Thumbnail Image */}
                  <div className={`w-full bg-neutral-900 ${aspectClass} overflow-hidden relative`}>
                    <img
                        src={thumbnail.imageUrl}
                        alt={thumbnail.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleDownload(thumbnail.imageUrl); }}
                            className="p-3 bg-white text-black rounded-xl hover:bg-pink-500 hover:text-white transition-all shadow-xl active:scale-90"
                        >
                            <DownloadIcon size={20} />
                        </button>
                        <Link 
                            to={`/youtube-preview?thumbnail_url=${thumbnail.imageUrl}&title=${thumbnail.title}`}
                            className="p-3 bg-black/60 backdrop-blur-md text-white rounded-xl border border-white/20 hover:border-pink-500 transition-all shadow-xl"
                        >
                            <ArrowUpRightIcon size={20} />
                        </Link>
                    </div>
                  </div>

                  {/* Metadata Info */}
                  <div className="p-6 border-t border-white/5">
                    <h3 className="text-white text-lg font-bold truncate mb-4 group-hover:text-pink-400 transition-colors">
                        {thumbnail.title}
                    </h3>
                    
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-neutral-400">
                            <Palette size={14} className="text-pink-500/70" />
                            <span className="text-xs font-medium uppercase tracking-tighter">Palette:</span>
                            <span className="text-xs text-neutral-200 bg-white/5 px-2 py-0.5 rounded">{thumbnail.colorScheme}</span>
                        </div>
                        <div className="flex items-center gap-2 text-neutral-400">
                            <CalendarDays size={14} className="text-blue-500/70" />
                            <span className="text-xs font-medium uppercase tracking-tighter">Created:</span>
                            <span className="text-xs text-neutral-200">
                                {new Date(thumbnail.createdAt!).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] font-black text-pink-500 uppercase tracking-[0.2em]">
                            {thumbnail.style}
                        </span>
                        <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">
                            {thumbnail.aspect}
                        </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Load More Button */}
        {!isLoading && visibleCount < filteredThumbnails.length && (
          <div className="flex justify-center mt-20 mb-32">
            <button 
              onClick={() => setVisibleCount(prev => prev + 6)}
              className="group relative px-12 py-4 bg-transparent text-white font-black rounded-2xl border-2 border-white/10 hover:border-pink-500 transition-all overflow-hidden"
            >
              <span className="relative z-10 tracking-widest uppercase">Explore More Magic</span>
              <div className="absolute inset-0 bg-pink-500 translate-y-[101%] group-hover:translate-y-0 transition-transform duration-300" />
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default CommunityPage