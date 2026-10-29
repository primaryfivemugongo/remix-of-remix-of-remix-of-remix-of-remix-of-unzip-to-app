import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, FolderOpen, Image as ImageIcon, Filter, Shuffle } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { buildFolderStructure, getFlatFolderList, getPhotos, shuffleArray, PhotoItem, FolderStructure } from "@/utils/galleryUtils";
import { GalleryGrid } from "@/components/admin/GalleryGrid";
import { StudentsPagination } from "@/components/admin/StudentsPagination";


export default function AdminQuotes() {
  const { userRole, userName, photoUrl, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [folderStructure, setFolderStructure] = useState<FolderStructure | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isShuffled, setIsShuffled] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [photosPerPage, setPhotosPerPage] = useState(20);
  const [allPhotos, setAllPhotos] = useState<PhotoItem[]>([]);

  // Load folder structure on mount
  useEffect(() => {
    const loadFolderStructure = async () => {
      setLoading(true);
      try {
        const structure = await buildFolderStructure();
        setFolderStructure(structure);
      } catch (error) {
        console.error('Error loading folder structure:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadFolderStructure();
  }, []);

  const handleLogout = () => {
    signOut();
  };

  // Get photos based on selected folder
  useEffect(() => {
    const loadPhotos = async () => {
      const loadedPhotos = await getPhotos(selectedFolder);
      const finalPhotos = isShuffled ? shuffleArray(loadedPhotos) : loadedPhotos;
      setAllPhotos(finalPhotos);
    };
    
    loadPhotos();
  }, [selectedFolder, isShuffled]);

  // Filter photos by search query
  const filteredPhotos = useMemo(() => {
    if (!searchQuery.trim()) return allPhotos;
    
    const query = searchQuery.toLowerCase();
    return allPhotos.filter(photo => 
      photo.alt.toLowerCase().includes(query) ||
      photo.folder.toLowerCase().includes(query) ||
      photo.category.toLowerCase().includes(query)
    );
  }, [allPhotos, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredPhotos.length / photosPerPage);
  const paginatedPhotos = useMemo(() => {
    const startIndex = (currentPage - 1) * photosPerPage;
    const endIndex = startIndex + photosPerPage;
    return filteredPhotos.slice(startIndex, endIndex);
  }, [filteredPhotos, currentPage, photosPerPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFolder, searchQuery, isShuffled]);

  // Auto scroll to top when page changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth"
    });
  }, [currentPage]);

  // Get folder options for dropdown
  const folderOptions = useMemo(() => {
    if (!folderStructure) return [];
    return getFlatFolderList(folderStructure);
  }, [folderStructure]);

  // Stats
  const totalPhotos = folderStructure?.count || 0;
  const displayedPhotos = filteredPhotos.length;
  const totalFolders = folderOptions.length - 1; // Exclude "All Quotes"
  const startIndex = (currentPage - 1) * photosPerPage + 1;
  const endIndex = Math.min(currentPage * photosPerPage, displayedPhotos);

  // Calculate visible page numbers for pagination
  const visiblePages = useMemo(() => {
    const pages: number[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible + 2) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if near start
      if (currentPage <= 3) {
        end = Math.min(totalPages - 1, 4);
      }
      
      // Adjust if near end
      if (currentPage >= totalPages - 2) {
        start = Math.max(2, totalPages - 3);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }, [currentPage, totalPages]);

  return (
    <DashboardLayout userRole={userRole || "admin"} userName={userName} photoUrl={photoUrl} onLogout={handleLogout}>
      <div className="max-w-7xl mx-auto space-y-6 pb-8">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Photo Gallery</h1>
            <p className="text-muted-foreground">Browse and manage your inspirational quote images</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Photos</CardTitle>
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPhotos}</div>
              <p className="text-xs text-muted-foreground">
                Showing {displayedPhotos} {searchQuery || selectedFolder ? 'filtered' : ''}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Folders</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalFolders}</div>
              <p className="text-xs text-muted-foreground">
                {selectedFolder ? 'Filtered view' : 'All folders'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current View</CardTitle>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {selectedFolder && selectedFolder !== 'all' ? folderOptions.find(f => f.value === selectedFolder)?.label.trim() : 'All'}
              </div>
              <p className="text-xs text-muted-foreground">Active filter</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by name, folder, or category..." 
                  className="pl-10" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                  <SelectTrigger className="w-full sm:flex-1">
                    <SelectValue placeholder="Select folder..." />
                  </SelectTrigger>
                  <SelectContent>
                    {folderOptions.map((folder) => (
                      <SelectItem key={folder.value} value={folder.value}>
                        {folder.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={photosPerPage.toString()} onValueChange={(value) => setPhotosPerPage(Number(value))}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12 per page</SelectItem>
                    <SelectItem value="20">20 per page</SelectItem>
                    <SelectItem value="40">40 per page</SelectItem>
                    <SelectItem value="60">60 per page</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant={isShuffled ? "default" : "outline"}
                  onClick={() => setIsShuffled(!isShuffled)}
                  className="w-full sm:w-auto"
                >
                  <Shuffle className="mr-2 h-4 w-4" />
                  {isShuffled ? 'Shuffled' : 'Sequential'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gallery Grid */}
        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground">Loading gallery...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : filteredPhotos.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No photos found</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {searchQuery 
                    ? "Try adjusting your search query or filters"
                    : "No images found in the selected folder"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex}-{endIndex} of {displayedPhotos} photos
              </p>
            </div>
            <GalleryGrid photos={paginatedPhotos} />
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <StudentsPagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                visiblePages={visiblePages}
              />
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}