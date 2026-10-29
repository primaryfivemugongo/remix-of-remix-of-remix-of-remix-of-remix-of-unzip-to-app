import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@/lib/router-compat";
import { toast } from "sonner";
import { HeroSection } from "@/components/entertainment/HeroSection";
import { MovieRow } from "@/components/entertainment/MovieRow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Movie } from "@/types/movie";
import { movieData, movieGenres } from "@/data/movieData";
import { Search, Filter, X, Play } from "lucide-react";
import { movieTitleToSlug } from "@/utils/movieUtils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Entertainment = () => {
  const { userRole, userName, photoUrl, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Get unique years from movie data
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(movieData.map(m => m.year))).sort((a, b) => b - a);
    return years;
  }, []);

  // Shuffle movies once and cache with session storage
  const shuffledMovies = useMemo(() => {
    const cacheKey = 'shuffled-movies-cache';
    const cached = sessionStorage.getItem(cacheKey);
    
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // If parse fails, continue to shuffle
      }
    }
    
    const shuffled = [...movieData];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    sessionStorage.setItem(cacheKey, JSON.stringify(shuffled));
    return shuffled;
  }, []);

  // Featured movie (random movie)
  const featuredMovie = shuffledMovies[0];

  const handleLogout = async () => {
    try {
      await signOut();
      toast.info("You have been logged out");
      navigate("/login");
    } catch (error: any) {
      toast.error("Failed to log out");
    }
  };

  // Filter movies based on selected filters and exclude Romance/Erotic content
  const filteredMovies = useMemo(() => {
    const restrictedGenres = ['Romance', 'Erotic', 'Adult'];
    let filtered = shuffledMovies.filter(movie => 
      !movie.genres.some(genre => restrictedGenres.includes(genre))
    );
    
    if (selectedGenre !== "all") {
      filtered = filtered.filter(movie => movie.genres.includes(selectedGenre));
    }
    
    if (selectedYear !== "all") {
      filtered = filtered.filter(movie => movie.year === parseInt(selectedYear));
    }
    
    return filtered;
  }, [shuffledMovies, selectedGenre, selectedYear]);

  // Animated and You May Also Like sections
  const animationMovies = useMemo(() => {
    return filteredMovies.filter(movie => movie.genres.includes('Animated')).slice(0, 15);
  }, [filteredMovies]);

  const randomMixedMovies = useMemo(() => {
    const restrictedGenres = ['Romance', 'Erotic', 'Adult', 'Animated'];
    return filteredMovies
      .filter(movie => !movie.genres.some(genre => restrictedGenres.includes(genre)))
      .slice(0, 15);
  }, [filteredMovies]);

  // All movies organized by genre (excluding restricted genres)
  const moviesByGenre = useMemo(() => {
    const restrictedGenres = ['Romance', 'Erotic', 'Adult', 'Animated'];
    const grouped: Record<string, Movie[]> = {};
    
    movieGenres
      .filter(genre => !restrictedGenres.includes(genre))
      .forEach(genre => {
        const genreMovies = filteredMovies.filter(m => m.genres.includes(genre));
        // Shuffle and take up to 15 movies per genre for scrolling
        grouped[genre] = genreMovies.sort(() => Math.random() - 0.5).slice(0, 15);
      });
    
    return grouped;
  }, [filteredMovies]);

  const clearFilters = () => {
    setSelectedGenre("all");
    setSelectedYear("all");
  };

  const hasActiveFilters = selectedGenre !== "all" || selectedYear !== "all";

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery) return null;
    
    return movieData.filter(movie =>
      movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.genres.some(genre => genre.toLowerCase().includes(searchQuery.toLowerCase())) ||
      movie.cast.some(actor => actor.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery]);

  const handleMovieClick = (movie: Movie) => {
    const movieSlug = movieTitleToSlug(movie.title);
    const basePath = userRole === "admin" ? "/admin" : userRole === "teacher" ? "/teacher" : "/student";
    navigate(`${basePath}/entertainment/${movieSlug}`);
  };


  return (
    <DashboardLayout 
      userRole={userRole || "student"} 
      userName={userName} 
      photoUrl={photoUrl} 
      onLogout={handleLogout}
    >
      <div className="w-full min-w-0 space-y-0 pb-6 sm:pb-8 lg:pb-12 min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        {/* Search Bar & Filters - Fixed at top */}
        <div className="w-full min-w-0 sticky top-0 z-20 bg-background/98 backdrop-blur-xl py-3 sm:py-4 px-2 sm:px-4 -mx-2 sm:-mx-4 border-b border-border/30 shadow-lg">
          <div className="w-full min-w-0 max-w-6xl mx-auto space-y-2 sm:space-y-3">
            {/* Search Bar */}
            <div className="relative w-full min-w-0">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
              <Input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full min-w-0 pl-10 sm:pl-12 pr-12 h-10 sm:h-12 rounded-full bg-muted/60 border border-border/50 focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:border-primary/60 text-sm sm:text-base transition-all shadow-sm"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-primary/10 flex-shrink-0"
              >
                <Filter className={`h-4 w-4 ${hasActiveFilters ? 'text-primary' : 'text-muted-foreground'}`} />
              </Button>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="w-full min-w-0 flex flex-wrap gap-2 items-center animate-in slide-in-from-top-2 duration-200">
                <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                  <SelectTrigger className="min-w-0 w-auto max-w-[140px] sm:max-w-[160px] h-9 rounded-full bg-muted/60 border-border/50">
                    <SelectValue placeholder="Genre" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] bg-background">
                    <SelectItem value="all">All Genres</SelectItem>
                    {movieGenres.map(genre => (
                      <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="min-w-0 w-auto max-w-[100px] sm:max-w-[120px] h-9 rounded-full bg-muted/60 border-border/50">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] bg-background">
                    <SelectItem value="all">All Years</SelectItem>
                    {availableYears.map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="h-9 rounded-full text-xs flex-shrink-0"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                )}
                
                <span className="text-xs text-muted-foreground ml-auto flex-shrink-0 truncate">
                  {filteredMovies.length} movies
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Search Results */}
        {searchResults && searchResults.length > 0 ? (
          <div className="w-full min-w-0 space-y-3 sm:space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-foreground px-2 sm:px-4">
              Search Results ({searchResults.length})
            </h2>
            <div className="px-2 sm:px-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {searchResults.map((movie, index) => (
                  <div
                    key={`${movie.title}-${index}`}
                    className="cursor-pointer group/card transition-all duration-300 hover:scale-105"
                    onClick={() => handleMovieClick(movie)}
                  >
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg group-hover/card:shadow-xl transition-all duration-300 group-hover/card:ring-2 group-hover/card:ring-primary/50">
                      <img 
                        src={movie.thumbnail}
                        alt={movie.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/300x450/e5e7eb/6b7280?text=Movie";
                        }}
                      />
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
            </div>
          </div>
        ) : searchQuery ? (
          <div className="w-full text-center py-12 sm:py-16 px-4">
            <div className="text-4xl sm:text-5xl mb-3">🔍</div>
            <p className="text-base sm:text-lg font-semibold text-foreground mb-2">No results found</p>
            <p className="text-sm text-muted-foreground">Try searching for something else</p>
          </div>
        ) : (
          <>
            {/* Hero Section */}
            <HeroSection 
              movie={featuredMovie}
              onPlay={() => handleMovieClick(featuredMovie)}
            />

            {/* Movie Rows */}
            <div className="w-full min-w-0 space-y-6 sm:space-y-8 mt-4 sm:mt-6">
              {/* Animated Movies */}
              {animationMovies.length > 0 && (
                <MovieRow 
                  title="Animated"
                  movies={animationMovies}
                  onMovieClick={handleMovieClick}
                />
              )}

              {/* You May Also Like */}
              {randomMixedMovies.length > 0 && (
                <MovieRow 
                  title="You May Also Like"
                  movies={randomMixedMovies}
                  onMovieClick={handleMovieClick}
                />
              )}

              {/* All Genre Rows */}
              {Object.entries(moviesByGenre).map(([genre, movies]) => (
                movies.length > 0 && (
                  <MovieRow 
                    key={genre}
                    title={genre}
                    movies={movies}
                    onMovieClick={handleMovieClick}
                  />
                )
              ))}
            </div>
          </>
        )}

      </div>
    </DashboardLayout>
  );
};

export default Entertainment;
