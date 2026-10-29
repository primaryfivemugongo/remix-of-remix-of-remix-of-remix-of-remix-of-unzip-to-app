import { Movie } from "@/types/movie";
import { Play, Film } from "lucide-react";
import { useState, useEffect } from "react";
import { getThumbnailUrl, extractThumbnailFilename } from "@/utils/movieThumbnailUtils";

interface MovieCardProps {
  movie: Movie;
  onClick: () => void;
}

const genreColors: Record<string, string> = {
  "Comedy": "from-yellow-500 to-yellow-700",
  "Fantasy": "from-purple-500 to-purple-700",
  "Drama": "from-blue-500 to-blue-700",
  "Action": "from-red-500 to-red-700",
  "Animation": "from-pink-500 to-pink-700",
  "Adventure": "from-green-500 to-green-700",
  "Crime": "from-gray-600 to-gray-800"
};

export function MovieCard({ movie, onClick }: MovieCardProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string>(movie.thumbnail);
  const primaryGenre = movie.genres[0] || "Drama";
  const gradientColor = genreColors[primaryGenre] || "from-gray-500 to-gray-700";

  useEffect(() => {
    const loadThumbnail = async () => {
      const filename = extractThumbnailFilename(movie.thumbnail);
      const url = await getThumbnailUrl(filename);
      setThumbnailUrl(url);
    };
    loadThumbnail();
  }, [movie.thumbnail]);

  return (
    <div 
      className="bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-2 hover:scale-105 border-2 border-border hover:border-primary/50 group"
      onClick={onClick}
    >
      {/* Thumbnail with Play Overlay */}
      <div className="relative w-full pt-[150%] bg-muted">
        <img 
          src={thumbnailUrl}
          alt={movie.title}
          className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = "https://via.placeholder.com/300x450/e5e7eb/6b7280?text=Movie+Poster";
          }}
        />
        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-white shadow-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-50 group-hover:scale-100">
            <Play className="w-10 h-10 text-primary fill-primary ml-1" />
          </div>
        </div>
        {/* Genre Badge */}
        <div className={`absolute top-3 right-3 bg-gradient-to-r ${gradientColor} text-white px-4 py-2 rounded-full text-sm font-bold shadow-xl flex items-center gap-2`}>
          <Film className="w-4 h-4" />
          {primaryGenre}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-card-foreground text-base mb-2 line-clamp-2 leading-relaxed">
          {movie.title}
        </h3>
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className="px-3 py-2 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg text-sm font-semibold text-primary border border-primary/20">
            📅 {movie.year}
          </span>
          {movie.genres.slice(0, 2).map((genre, index) => (
            <span key={index} className="px-3 py-2 bg-gradient-to-r from-secondary/20 to-secondary/10 rounded-lg text-xs font-semibold text-secondary-foreground border border-secondary/20">
              🎬 {genre}
            </span>
          ))}
        </div>
        {movie.cast && movie.cast.length > 0 && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            ⭐ {movie.cast.slice(0, 2).join(", ")}
          </p>
        )}
      </div>
    </div>
  );
}
