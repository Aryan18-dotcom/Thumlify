import { useEffect, useState, useMemo } from "react"
import SoftBackDrop from "../components/SoftBackDrop"
import { dummyThumbnails, type IThumbnail } from "../assets"
import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRightIcon, DownloadIcon, TrashIcon, Search, X } from "lucide-react";

const MyGenerationsPage = () => {
  const navigate = useNavigate();

  const aspectRatioClassMap: Record<string, string> = {
    '16:9': 'aspect-video',
    '1:1': 'aspect-square',
    '9:16': 'aspect-[9/16]',
  } 

  const [Thumbnails, setThumbnails] = useState<IThumbnail[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState<string>("")

  const fetchThumbnails = async () => {
    setThumbnails(dummyThumbnails as unknown as IThumbnail[])
    setIsLoading(false)
  }

  // SEARCH LOGIC: Filters based on title, style, color, or aspect
  const filteredThumbnails = useMemo(() => {
    return Thumbnails.filter((thumb) => {
      const query = searchQuery.toLowerCase();
      return (
        thumb.title.toLowerCase().includes(query) ||
        thumb.style.toLowerCase().includes(query) ||
        thumb.colorScheme.toLowerCase().includes(query) ||
        thumb.aspect.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, Thumbnails]);

  const handleDelete = (id: string) => {
    console.log("Delete thumbnail with id:", id);
  }

  const handleDownload = (image_url: string) => {
    window.open(image_url, '_blank');
  }

  useEffect(() => {
    fetchThumbnails()
  }, [])

  return (
    <>
      <SoftBackDrop />
      <div className="mt-32 min-h-screen px-6 md:px-16 lg:px-24 xl:px-32">
        {/* Header Section with Search */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="border-l-4 border-pink-500 pl-6">
            <h1 className="text-3xl font-semibold text-neutral-200">My Generations</h1>
            <p className="mt-1 text-lg text-neutral-500">View and manage all your AI-Generated Thumbnails.</p>
          </div>

          {/* Search Input - Styled to match your theme */}
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-neutral-500 group-focus-within:text-pink-500 transition-colors" />
            <input 
              type="text"
              placeholder="Search your gallery..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-10 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-pink-500/50 transition-all"
            />
            {searchQuery && (
              <X 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-neutral-500 hover:text-white cursor-pointer" 
              />
            )}
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="rounded-2xl bg-white/5 border border-white/10 animate-pulse h-64 w-full break-inside-avoid"></div>
            ))}
          </div>
        )}

        {/* Empty State / No Results Found */}
        {!isLoading && filteredThumbnails.length === 0 && (
          <div className="text-center py-24 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
            <h3 className="text-lg font-semibold text-neutral-200">
                {searchQuery ? "No matching thumbnails found" : "No Generations Found!"}
            </h3>
            <p className="text-sm text-neutral-400 mt-1">
                {searchQuery ? "Try a different search term." : "Start creating your AI-generated thumbnails!"}
            </p>
          </div>
        )}

        {/* Thumbnails Grid */}
        {!isLoading && filteredThumbnails.length > 0 && (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {filteredThumbnails.map((thumbnail: IThumbnail) => {
              const aspectClass = aspectRatioClassMap[thumbnail.aspect] || 'aspect-video';

              return (
                <div 
                  key={thumbnail._id} 
                  onClick={() => navigate(`/generate/${thumbnail._id}`)} 
                  className="break-inside-avoid group relative cursor-pointer rounded-2xl bg-white/5 border border-white/10 hover:border-pink-500/50 transition-all duration-300 shadow-xl overflow-hidden mb-6"
                >
                  <div className={`w-full bg-black/40 ${aspectClass} overflow-hidden relative`}>
                    {thumbnail.imageUrl ? (
                      <img
                        src={thumbnail.imageUrl}
                        alt={thumbnail.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white/5">
                        <span className="text-sm text-neutral-500">
                          {thumbnail.isGenerating ? 'Generating...' : 'No Image'}
                        </span>
                      </div>
                    )}

                    {thumbnail.isGenerating && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-white text-xs font-medium">Processing...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="text-white text-sm font-semibold truncate">{thumbnail.title}</h3>
                    <div className="flex flex-wrap gap-2 text-sm text-neutral-400 mt-1">
                      <span className="px-2 py-0.5 rounded bg-white/8 text-[10px]">{thumbnail.style}</span>
                      <span className="px-2 py-0.5 rounded bg-white/8 text-[10px]">{thumbnail.colorScheme}</span>
                      <span className="px-2 py-0.5 rounded bg-white/8 text-[10px]">{thumbnail.aspect}</span>
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-3">
                      Created on - {new Date(thumbnail.createdAt!).toDateString()}
                    </p>
                  </div>

                  <div onClick={(e)=>e.stopPropagation()} className="absolute bottom-2 right-2 max-sm:flex sm:hidden group-hover:flex gap-1.5 z-10">
                    <TrashIcon onClick={()=> handleDelete(thumbnail._id)} className="size-6 bg-black/50 p-1.5 rounded hover:bg-pink-600 transition-all" />
                    <DownloadIcon onClick={()=> handleDownload(thumbnail.imageUrl)} className="size-6 bg-black/50 p-1.5 rounded hover:bg-pink-600 transition-all" />
                    <Link target="_blank" to={`/youtube-preview?thumbnail_url=${thumbnail.imageUrl}&title=${thumbnail.title}`} onClick={(e)=>e.stopPropagation()}>
                        <ArrowUpRightIcon className="size-6 bg-black/50 p-1.5 rounded hover:bg-pink-600 transition-all" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

export default MyGenerationsPage