// Utility for managing photo gallery from local JSON file

export interface PhotoItem {
  id: string;
  src: string;
  alt: string;
  folder: string;
  folderPath: string;
  category: string;
}

export interface FolderStructure {
  name: string;
  path: string;
  count: number;
  subfolders?: FolderStructure[];
}

interface GalleryFolder {
  path: string;
  images: string[];
  subfolders?: string[];
}

interface GalleryData {
  [key: string]: GalleryFolder;
}

const CACHE_KEY = 'gallery-data';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface CachedGalleryData {
  data: GalleryData;
  timestamp: number;
}

// Fetch gallery data from local JSON file
const fetchGalleryData = async (): Promise<GalleryData> => {
  try {
    const response = await fetch('/gallery.json');
    if (!response.ok) {
      console.error(`Error fetching gallery.json: ${response.status}`);
      return {};
    }
    const data: GalleryData = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading gallery data:', error);
    return {};
  }
};

// Get all gallery data with caching
const getAllGalleryData = async (): Promise<GalleryData> => {
  // Check cache first
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    try {
      const { data, timestamp }: CachedGalleryData = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    } catch (error) {
      console.error('Error parsing cached gallery data:', error);
    }
  }

  // Fetch from local JSON file
  const data = await fetchGalleryData();
  
  // Cache the results
  const cacheData: CachedGalleryData = {
    data,
    timestamp: Date.now()
  };
  localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

  return data;
};

// Extract folder structure from gallery data
export const buildFolderStructure = async (): Promise<FolderStructure> => {
  const galleryData = await getAllGalleryData();
  
  // Build a tree structure
  const root: FolderStructure = {
    name: 'All Photos',
    path: '',
    count: 0,
    subfolders: []
  };

  const folderMap = new Map<string, FolderStructure>();
  folderMap.set('', root);

  // Process each folder in the gallery data
  Object.entries(galleryData).forEach(([folderKey, folderData]) => {
    if (folderKey === '') {
      // Root folder - count all images recursively
      root.count = Object.values(galleryData).reduce((total, folder) => total + folder.images.length, 0);
      return;
    }

    const parts = folderData.path.split('/').filter(p => p);
    if (parts.length === 0) return;

    let currentPath = '';
    let parentFolder = root;

    parts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      
      if (!folderMap.has(currentPath)) {
        const newFolder: FolderStructure = {
          name: part,
          path: currentPath,
          count: 0,
          subfolders: []
        };
        
        folderMap.set(currentPath, newFolder);
        
        if (parentFolder.subfolders) {
          parentFolder.subfolders.push(newFolder);
        }
      }
      
      parentFolder = folderMap.get(currentPath)!;
    });

    // Set count for this folder
    const folder = folderMap.get(folderData.path);
    if (folder) {
      folder.count = folderData.images.length;
      
      // Add counts from subfolders if any
      if (folderData.subfolders) {
        folderData.subfolders.forEach(subfolderName => {
          const subfolderPath = `${folderData.path}/${subfolderName}`;
          const subfolderData = galleryData[subfolderPath];
          if (subfolderData) {
            folder.count += subfolderData.images.length;
          }
        });
      }
    }
  });

  return root;
};

// Get all folder paths in a flat list for dropdown
export const getFlatFolderList = (structure: FolderStructure, level = 0): Array<{label: string, value: string, count: number}> => {
  const result: Array<{label: string, value: string, count: number}> = [];
  
  if (level === 0) {
    result.push({
      label: `All Photos (${structure.count})`,
      value: 'all',
      count: structure.count
    });
  }
  
  if (structure.subfolders) {
    structure.subfolders.forEach(subfolder => {
      const indent = '  '.repeat(level);
      result.push({
        label: `${indent}${subfolder.name} (${subfolder.count})`,
        value: subfolder.path,
        count: subfolder.count
      });
      
      if (subfolder.subfolders && subfolder.subfolders.length > 0) {
        result.push(...getFlatFolderList(subfolder, level + 1));
      }
    });
  }
  
  return result;
};

// Get all photos, optionally filtered by folder
export const getPhotos = async (folderFilter: string = 'all'): Promise<PhotoItem[]> => {
  const galleryData = await getAllGalleryData();
  const photos: PhotoItem[] = [];
  
  Object.entries(galleryData).forEach(([folderKey, folderData]) => {
    if (folderKey === '') return; // Skip root
    
    // Check if this folder matches the filter
    if (folderFilter !== 'all' && !folderData.path.startsWith(folderFilter)) {
      return;
    }
    
    folderData.images.forEach((imageUrl, index) => {
      const urlParts = imageUrl.split('/');
      const filename = urlParts[urlParts.length - 1];
      const parts = folderData.path.split('/');
      const folder = parts[parts.length - 1] || 'Root';
      
      photos.push({
        id: `photo-${folderData.path}-${index}-${filename}`,
        src: imageUrl,
        alt: filename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '').replace(/-|_/g, ' '),
        folder,
        folderPath: folderData.path,
        category: parts[0] || 'General'
      });
    });
  });
  
  return photos;
};

// Shuffle array for random display
export const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
