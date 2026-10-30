import { youtubeId } from "@/lib/coordinator/rules";

export function ManifestoMedia({ photos = [], video }: { photos?: string[]; video?: string | null }) {
  const id = video ? youtubeId(video) : null;
  return <div className="space-y-4">
    {photos.length > 0 && <div className="grid grid-cols-2 gap-3">{photos.map((photo, i) => <img key={i} src={photo} alt={`Manifesto photo ${i + 1}`} className="aspect-square w-full rounded-lg object-cover" />)}</div>}
    {id && <iframe title="Candidate manifesto video" src={`https://www.youtube-nocookie.com/embed/${id}`} className="aspect-video w-full rounded-lg border border-border" loading="lazy" allow="encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />}
  </div>;
}