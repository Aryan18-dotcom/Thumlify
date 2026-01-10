import { useSearchParams } from "react-router-dom"
import { yt_html } from "../assets"

const YouTubePreviewPage = () => {

  const [searchParams] = useSearchParams();

  const thumbnail_url = searchParams.get("thumbnail_url");
  const title = searchParams.get("title");

  const new_html = yt_html.replace("%%THUMBNAIL_URL%%", thumbnail_url!).replace("%%TITLE%%", title!);


  return (
    <div className="fixed inset-0 z-100 bg-black h-full w-full">
      <iframe
        title="YouTube Preview"
        srcDoc={new_html}
        width={100}
        height={100}
        allowFullScreen
        className="h-full w-full border-0"
      />
    </div>
  )
}

export default YouTubePreviewPage