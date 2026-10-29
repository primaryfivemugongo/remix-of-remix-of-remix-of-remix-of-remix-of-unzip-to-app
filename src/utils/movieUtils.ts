/**
 * Convert a movie title to a URL-safe slug
 */
export function movieTitleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
}

/**
 * Convert a slug back to match against movie titles
 * This is a fuzzy match that handles the slug format
 */
export function findMovieBySlug(slug: string, movies: any[]): any | undefined {
  const normalizedSlug = slug.toLowerCase();
  return movies.find(movie => {
    const movieSlug = movieTitleToSlug(movie.title);
    return movieSlug === normalizedSlug;
  });
}
