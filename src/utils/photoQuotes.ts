// Utility to handle photo quotes from local JSON file
export interface PhotoQuote {
  src: string;
  alt: string;
}

const CACHE_KEY = 'quote-images';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface QuotationsData {
  "": {
    path: string;
    images: string[];
  };
}

interface CachedImages {
  images: string[];
  timestamp: number;
}

// Get all quote images from local JSON file
const getQuoteImages = async (): Promise<string[]> => {
  // Check cache first
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    try {
      const { images, timestamp }: CachedImages = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return images;
      }
    } catch (error) {
      console.error('Error parsing cached images:', error);
    }
  }

  // Fetch from local JSON file
  try {
    const response = await fetch('/quotations.json');
    if (!response.ok) {
      throw new Error(`Error loading quotations: ${response.status}`);
    }
    
    const data: QuotationsData = await response.json();
    const imageUrls = data[""]?.images || [];

    // Cache the results
    const cacheData: CachedImages = {
      images: imageUrls,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

    return imageUrls;
  } catch (error) {
    console.error('Error fetching quotations:', error);
    
    // Return cached data even if expired, as fallback
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { images }: CachedImages = JSON.parse(cached);
        return images;
      } catch {
        return [];
      }
    }
    
    return [];
  }
};

// Get the quote of the day (persistent across sessions)
export const getQuoteOfTheDay = async (): Promise<PhotoQuote> => {
  // Check if we have a stored quote for today
  const today = new Date().toDateString();
  const storedQuote = localStorage.getItem('quote-of-the-day');
  const storedDate = localStorage.getItem('quote-date');

  if (storedQuote && storedDate === today) {
    try {
      return JSON.parse(storedQuote);
    } catch {
      // If parsing fails, fall through to generate new quote
    }
  }

  const images = await getQuoteImages();
  
  if (images.length === 0) {
    // Fallback if no images found
    return {
      src: '/placeholder.svg',
      alt: 'No quote available'
    };
  }

  // Generate new quote for today
  const randomIndex = Math.floor(Math.random() * images.length);
  const selectedImage = images[randomIndex];
  
  const quote = {
    src: selectedImage,
    alt: `Inspirational quote ${randomIndex + 1}`
  };

  // Store the quote and date
  localStorage.setItem('quote-of-the-day', JSON.stringify(quote));
  localStorage.setItem('quote-date', today);

  return quote;
};

// Get a random photo quote (for when user requests a new one)
export const getRandomPhotoQuote = async (): Promise<PhotoQuote> => {
  const images = await getQuoteImages();
  
  if (images.length === 0) {
    // Fallback if no images found
    return {
      src: '/placeholder.svg',
      alt: 'No quote available'
    };
  }
  
  const randomIndex = Math.floor(Math.random() * images.length);
  const selectedImage = images[randomIndex];
  
  const quote = {
    src: selectedImage,
    alt: `Inspirational quote ${randomIndex + 1}`
  };

  // Update stored quote when user requests new one
  const today = new Date().toDateString();
  localStorage.setItem('quote-of-the-day', JSON.stringify(quote));
  localStorage.setItem('quote-date', today);
  
  return quote;
};

// Preload next quote for smooth transitions
export const preloadNextQuote = async (): Promise<PhotoQuote> => {
  const nextQuote = await getQuoteOfTheDay();
  
  // Preload the image
  const img = new Image();
  img.src = nextQuote.src;
  
  return nextQuote;
};
