import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "@/lib/router-compat";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { MovieRow } from "@/components/entertainment/MovieRow";
import { MovieModal } from "@/components/entertainment/MovieModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, ArrowLeft } from "lucide-react";
import { Movie } from "@/types/movie";
import { movieData, movieGenres } from "@/data/movieData";
import { movieTitleToSlug, findMovieBySlug } from "@/utils/movieUtils";
import { getThumbnailUrl, extractThumbnailFilename } from "@/utils/movieThumbnailUtils";

const MovieDetail = () => {
  const { movieId } = useParams<{ movieId: string }>();
  const navigate = useNavigate();
  const { userRole, userName, photoUrl, signOut } = useAuth();
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");

  const movie = useMemo(() => {
    if (!movieId) return undefined;
    return findMovieBySlug(movieId, movieData);
  }, [movieId]);

  const recommendedMovies = useMemo(() => {
    if (!movie) return [];
    const currentSlug = movieTitleToSlug(movie.title);
    // Get movies that share at least one genre with current movie
    const matches = movieData.filter(
      (m) =>
        m.genres.some(genre => movie.genres.includes(genre)) &&
        movieTitleToSlug(m.title) !== currentSlug
    );
    // Shuffle and return
    return matches.sort(() => Math.random() - 0.5).slice(0, 12);
  }, [movie, movieId]);

  const moviesByGenre = useMemo(() => {
    const grouped: Record<string, Movie[]> = {};
    movieGenres.forEach(genre => {
      const genreMovies = movieData.filter(m => m.genres.includes(genre));
      // Shuffle movies within each genre
      grouped[genre] = genreMovies.sort(() => Math.random() - 0.5).slice(0, 15);
    });
    return grouped;
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.info("You have been logged out");
      navigate("/login");
    } catch (error: any) {
      toast.error("Failed to log out");
    }
  };

  const handleMovieClick = (clickedMovie: Movie) => {
    const movieSlug = movieTitleToSlug(clickedMovie.title);
    const basePath = userRole === "admin" ? "/admin" : userRole === "teacher" ? "/teacher" : "/student";
    navigate(`${basePath}/entertainment/${movieSlug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlayMovie = () => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  const handleBack = () => {
    const basePath = userRole === "admin" ? "/admin" : userRole === "teacher" ? "/teacher" : "/student";
    navigate(`${basePath}/entertainment`);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [movieId]);

  useEffect(() => {
    const loadThumbnail = async () => {
      if (movie?.thumbnail) {
        const filename = extractThumbnailFilename(movie.thumbnail);
        const url = await getThumbnailUrl(filename);
        setThumbnailUrl(url);
      }
    };
    loadThumbnail();
  }, [movie]);

  if (!movie) {
    return (
      <DashboardLayout 
        userRole={userRole || "student"} 
        userName={userName} 
        photoUrl={photoUrl} 
        onLogout={handleLogout}
      >
        <div className="text-center py-24">
          <h2 className="text-2xl font-bold text-foreground mb-4">Movie not found</h2>
          <Button onClick={handleBack}>Back to Entertainment</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      userRole={userRole || "student"} 
      userName={userName} 
      photoUrl={photoUrl} 
      onLogout={handleLogout}
    >
      <div className="w-full max-w-[100vw] overflow-x-hidden">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={handleBack}
            className="gap-2 hover:bg-muted"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Entertainment
          </Button>

          {/* Hero Card */}
          <Card className="overflow-hidden border-0 shadow-xl">
            <div className="relative bg-gradient-to-br from-muted/50 to-background">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6 lg:p-8">
                  
                  {/* Left: Poster & Play Button */}
                  <div className="lg:col-span-3 flex flex-col items-center lg:items-start gap-4">
                    <div className="w-full max-w-[280px]">
                      <img 
                        src={thumbnailUrl || movie.thumbnail}
                        alt={movie.title}
                        className="w-full aspect-[2/3] object-cover rounded-lg shadow-lg"
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/300x450/1a1a1a/ffffff?text=Movie+Poster";
                        }}
                      />
                    </div>
                    
                    {/* Play Button */}
                    <Button 
                      size="lg" 
                      onClick={handlePlayMovie}
                      className="w-full max-w-[280px] gap-2"
                    >
                      <Play className="w-5 h-5 fill-current" />
                      Play Movie
                    </Button>
                  </div>

                  {/* Right: Movie Details */}
                  <div className="lg:col-span-9 space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                        {movie.title}
                      </h1>
                      {/* Year & Genres as compact labels */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                          {movie.year}
                        </span>
                        {movie.genres && movie.genres.length > 0 && (
                          <>
                            {movie.genres.map((genre) => (
                              <span 
                                key={genre}
                                className="px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground"
                              >
                                {genre}
                              </span>
                            ))}
                          </>
                        )}
                      </div>
                    </div>

                    {/* The Story */}
                    {movie.extract && (
                      <div>
                        <h2 className="text-xl font-bold text-foreground mb-3">The Story</h2>
                        <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                          {movie.extract}
                        </p>
                      </div>
                    )}

                    {/* Cast */}
                    {movie.cast && movie.cast.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-2">Cast</h3>
                        <p className="text-muted-foreground leading-relaxed text-sm">
                          {movie.cast.join(", ")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>

          {/* You May Also Like - Movies from same genres */}
          {recommendedMovies.length > 0 && (
            <div>
              <MovieRow 
                title="You May Also Like"
                movies={recommendedMovies}
                onMovieClick={handleMovieClick}
              />
            </div>
          )}

          {/* Genre Categories */}
          {movieGenres.map(genre => (
            moviesByGenre[genre].length > 0 && (
              <div key={genre}>
                <MovieRow 
                  title={genre}
                  movies={moviesByGenre[genre]}
                  onMovieClick={handleMovieClick}
                />
              </div>
            )
          ))}
        </div>
      </div>

      <MovieModal 
        movie={selectedMovie}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </DashboardLayout>
  );
};

export default MovieDetail;

