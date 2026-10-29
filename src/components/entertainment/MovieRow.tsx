import { Movie } from "@/types/movie";
import { ArrowLeft, ArrowRight, Play } from "lucide-react";
import { useRef, useState, useEffect, memo } from "react";
import { Button } from "@/components/ui/button";
import { getThumbnailUrl, extractThumbnailFilename } from "@/utils/movieThumbnailUtils";

interface MovieRowProps {
  title: string;
  movies: Movie[];
  onMovieClick: (movie: Movie) => void;
}

const MovieThumbnail = memo(({ movie }: { movie: Movie }) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string>(movie.thumbnail);

  useEffect(() => {
    const loadThumbnail = async () => {
      const filename = extractThumbnailFilename(movie.thumbnail);
      const url = await getThumbnailUrl(filename);
      setThumbnailUrl(url);
    };
    loadThumbnail();
  }, [movie.thumbnail]);

  return (
    <img 
      src={thumbnailUrl}
      alt={movie.title}
      className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
      loading="lazy"
      onError={(e) => {
        e.currentTarget.src = "https://via.placeholder.com/300x450/e5e7eb/6b7280?text=Movie";
      }}
    />
  );
});

export const MovieRow = memo(function MovieRow({ title, movies, onMovieClick }: MovieRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '200px' }
    );

    if (rowRef.current) {
      observer.observe(rowRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Check scroll state on mount and when content loads
  useEffect(() => {
    if (!scrollRef.current || !isVisible) return;
    
    const checkScroll = () => {
      handleScroll();
    };
    
    // Check immediately
    checkScroll();
    
    // Check after images might have loaded
    const timer = setTimeout(checkScroll, 100);
    
    return () => clearTimeout(timer);
  }, [isVisible, movies]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    
    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
    
    scrollRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    
    setCanScrollLeft(scrollRef.current.scrollLeft > 0);
    setCanScrollRight(
      scrollRef.current.scrollLeft < scrollRef.current.scrollWidth - scrollRef.current.clientWidth - 10
    );
  };

  return (
    <div ref={rowRef} className="w-full min-w-0 space-y-3 sm:space-y-4 py-2 px-2 sm:px-4">
      {title && (
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground tracking-tight">
          {title}
        </h2>
      )}
      
      {!isVisible ? (
        <div className="w-full h-48 sm:h-56 md:h-64 bg-muted/20 animate-pulse rounded-lg" />
      ) : (
        <>
          {/* Mobile Grid Layout */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:hidden">
            {movies.slice(0, 12).map((movie, index) => (
              <div
                key={`${movie.title}-${index}`}
                className="cursor-pointer group/card transition-all duration-300 hover:scale-105"
                onClick={() => onMovieClick(movie)}
              >
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg group-hover/card:shadow-xl transition-all duration-300 group-hover/card:ring-2 group-hover/card:ring-primary/50">
                  <MovieThumbnail movie={movie} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/95 flex items-center justify-center shadow-xl scale-0 group-hover/card:scale-100 transition-all duration-300">
                      <Play className="w-6 h-6 text-black fill-black ml-0.5" />
                    </div>
                  </div>
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-foreground mt-2 line-clamp-2 leading-tight group-hover/card:text-primary transition-colors">
                  {movie.title}
                </h3>
              </div>
            ))}
          </div>

          {/* Desktop Horizontal Scroll */}
          <div className="relative group/row hidden lg:block">
            {canScrollLeft && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-12 w-12 xl:h-14 xl:w-14 rounded-full bg-background/95 backdrop-blur-md opacity-0 group-hover/row:opacity-100 transition-all duration-300 shadow-2xl hover:scale-110 hover:bg-primary/20 border-2 border-primary/40"
                onClick={() => scroll('left')}
              >
                <ArrowLeft className="w-5 h-5 xl:w-6 xl:h-6 text-primary" />
              </Button>
            )}

            <div 
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {movies.map((movie, index) => (
                <div
                  key={`${movie.title}-${index}`}
                  className="flex-shrink-0 w-44 xl:w-52 snap-start cursor-pointer group/card transition-all duration-300 hover:scale-105 hover:z-10"
                  onClick={() => onMovieClick(movie)}
                >
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-xl group-hover/card:shadow-2xl transition-all duration-300 group-hover/card:ring-4 group-hover/card:ring-primary/60">
                    <MovieThumbnail movie={movie} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-all duration-300 flex items-center justify-center">
                      <div className="w-14 h-14 xl:w-16 xl:h-16 rounded-full bg-white/95 flex items-center justify-center shadow-2xl scale-0 group-hover/card:scale-100 transition-all duration-300 animate-pulse">
                        <Play className="w-7 h-7 xl:w-8 xl:h-8 text-black fill-black ml-1" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-sm xl:text-base font-semibold text-foreground mt-3 line-clamp-2 leading-snug group-hover/card:text-primary transition-colors">
                    {movie.title}
                  </h3>
                </div>
              ))}
            </div>

            {canScrollRight && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-12 w-12 xl:h-14 xl:w-14 rounded-full bg-background/95 backdrop-blur-md opacity-0 group-hover/row:opacity-100 transition-all duration-300 shadow-2xl hover:scale-110 hover:bg-primary/20 border-2 border-primary/40"
                onClick={() => scroll('right')}
              >
                <ArrowRight className="w-5 h-5 xl:w-6 xl:h-6 text-primary" />
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
});
