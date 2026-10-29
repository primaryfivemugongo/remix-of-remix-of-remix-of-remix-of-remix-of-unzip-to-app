import { Movie } from "@/types/movie";
import { Button } from "@/components/ui/button";
import { Play, Info } from "lucide-react";

interface HeroSectionProps {
  movie: Movie;
  onPlay: () => void;
}

export function HeroSection({ movie, onPlay }: HeroSectionProps) {
  return (
    <div className="relative w-full h-[55vh] sm:h-[65vh] lg:h-[80vh] mb-0 overflow-hidden">
      {/* Background Video/Image */}
      <div className="absolute inset-0 after:absolute after:inset-0 after:bg-gradient-to-t after:from-background after:via-background/60 after:to-transparent after:z-10">
        {movie.trailerUrl ? (
          <video 
            src={movie.trailerUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Failed to load video, falling back to image');
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <img 
            src={movie.thumbnail}
            alt={movie.title}
            className="w-full h-full object-cover scale-105 animate-[zoom-in_20s_ease-out_infinite_alternate]"
            onError={(e) => {
              e.currentTarget.src = "https://via.placeholder.com/1920x1080/1a1a1a/ffffff?text=Movie+Banner";
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 sm:via-background/85 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent z-10" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-6 sm:p-10 lg:p-20 space-y-3 sm:space-y-5 lg:space-y-7 max-w-xl lg:max-w-4xl z-20">
        <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold text-foreground drop-shadow-[0_2px_20px_rgba(0,0,0,0.8)] leading-tight animate-fade-in">
          {movie.title}
        </h1>
        
        <div className="flex items-center gap-3 sm:gap-4 lg:gap-5 text-sm sm:text-base lg:text-xl flex-wrap animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <span className="text-foreground font-bold bg-primary/20 px-3 py-1 rounded">{movie.year}</span>
          <span className="text-foreground/80">•</span>
          <div className="flex gap-2 flex-wrap">
            {movie.genres.slice(0, 3).map((genre, idx) => (
              <span key={idx} className="text-foreground/90 bg-muted/50 px-3 py-1 rounded">{genre}</span>
            ))}
          </div>
        </div>

        <p className="text-sm sm:text-lg lg:text-xl text-foreground/90 line-clamp-2 sm:line-clamp-3 leading-relaxed hidden sm:block max-w-2xl drop-shadow-md animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {movie.extract}
        </p>

        <div className="flex gap-3 sm:gap-4 lg:gap-5 pt-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <Button 
            size="lg" 
            onClick={onPlay}
            className="gap-2 sm:gap-3 text-sm sm:text-base lg:text-xl font-bold h-11 sm:h-14 lg:h-16 px-6 sm:px-8 lg:px-12 rounded-md bg-white text-black hover:bg-white/90 hover:scale-105 transition-all shadow-xl hover:shadow-2xl"
          >
            <Play className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 fill-current" />
            <span>Play</span>
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={onPlay}
            className="gap-2 sm:gap-3 text-sm sm:text-base lg:text-xl font-semibold h-11 sm:h-14 lg:h-16 px-6 sm:px-8 lg:px-12 rounded-md bg-muted/40 backdrop-blur-md border-2 border-border/50 hover:bg-muted/60 hover:border-primary/50 hover:scale-105 transition-all shadow-lg"
          >
            <Info className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
            <span>More Info</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
