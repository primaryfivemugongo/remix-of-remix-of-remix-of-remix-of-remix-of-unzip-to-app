// Utility for fetching movie thumbnails from local JSON file with 24-hour caching

const CACHE_KEY = 'movie-thumbnails';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface ThumbnailsData {
  "": {
    path: string;
    images: string[];
  };
}

interface CachedThumbnails {
  thumbnails: Record<string, string>;
  timestamp: number;
}

// Fetch all thumbnails from local JSON file
const fetchThumbnailsFromJSON = async (): Promise<Record<string, string>> => {
  const thumbnails: Record<string, string> = {};
  
  try {
    const response = await fetch('/thumbnails.json');
    
    if (!response.ok) {
      console.error(`Error loading thumbnails: ${response.status}`);
      return thumbnails;
    }
    
    const data: ThumbnailsData = await response.json();
    const imageUrls = data[""]?.images || [];
    
    imageUrls.forEach(url => {
      const parts = url.split('/');
      const filename = parts[parts.length - 1];
      thumbnails[filename] = url;
    });
  } catch (error) {
    console.error('Error fetching thumbnails:', error);
  }
  
  return thumbnails;
};

// Get all thumbnails with caching
export const getMovieThumbnails = async (): Promise<Record<string, string>> => {
  // Check cache first
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    try {
      const { thumbnails, timestamp }: CachedThumbnails = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return thumbnails;
      }
    } catch (error) {
      console.error('Error parsing cached thumbnails:', error);
    }
  }

  // Fetch from local JSON file
  const thumbnails = await fetchThumbnailsFromJSON();
  
  // Cache the results
  const cacheData: CachedThumbnails = {
    thumbnails,
    timestamp: Date.now()
  };
  localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

  return thumbnails;
};

// Get thumbnail URL by filename
export const getThumbnailUrl = async (filename: string): Promise<string> => {
  const thumbnails = await getMovieThumbnails();
  return thumbnails[filename] || `https://via.placeholder.com/300x450/1a1a1a/ffffff?text=Movie+Poster`;
};

// Extract filename from old thumbnail path
export const extractThumbnailFilename = (thumbnailPath: string): string => {
  // Extract filename from paths like:
  // "https://gloriouschools.github.io/glorious-gateway/src/assets/thumbnails/Dr_dolittle_two_ver2.jpg"
  // "/assets/thumbnails/Dr_dolittle_two_ver2.jpg"
  // "thumbnails/Dr_dolittle_two_ver2.jpg"
  const parts = thumbnailPath.split('/');
  return parts[parts.length - 1];
};
