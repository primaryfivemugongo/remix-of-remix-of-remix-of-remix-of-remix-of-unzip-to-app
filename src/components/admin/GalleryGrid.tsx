import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Download, Maximize2 } from "lucide-react";
import { PhotoItem } from "@/utils/galleryUtils";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface GalleryGridProps {
  photos: PhotoItem[];
  onPhotoClick?: (photo: PhotoItem) => void;
}

// Helper function to download image
const downloadImage = async (src: string, alt: string) => {
  try {
    const response = await fetch(src);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${alt}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast({
      title: "Download started",
      description: "Your image is being downloaded.",
    });
  } catch (error) {
    toast({
      title: "Download failed",
      description: "There was an error downloading the image.",
      variant: "destructive",
    });
  }
};

export function GalleryGrid({ photos, onPhotoClick }: GalleryGridProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);

  const handlePhotoClick = (photo: PhotoItem) => {
    setSelectedPhoto(photo);
    onPhotoClick?.(photo);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <Card 
            key={photo.id} 
            className="group relative overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
            onClick={() => handlePhotoClick(photo)}
          >
            <div className="aspect-square relative overflow-hidden bg-muted">
              <img
                src={photo.src}
                alt={photo.alt}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
            </div>
            
            {/* Photo info */}
            <div className="p-3 space-y-2">
              <p className="text-sm font-medium truncate">{photo.folder}</p>
              <div className="flex items-center gap-2 flex-wrap">
                {photo.category !== photo.folder && (
                  <Badge variant="outline" className="text-xs">
                    {photo.category}
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Photo detail dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{selectedPhoto?.folder}</DialogTitle>
            <DialogDescription>
              {selectedPhoto?.category}
            </DialogDescription>
          </DialogHeader>
          {selectedPhoto && (
            <div className="space-y-4">
              <div className="relative w-full">
                <img
                  src={selectedPhoto.src}
                  alt={selectedPhoto.alt}
                  className="w-full h-auto rounded-lg"
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary">{selectedPhoto.folder}</Badge>
                <Badge variant="outline">{selectedPhoto.category}</Badge>
              </div>
              <Button 
                className="w-full"
                onClick={() => {
                  downloadImage(selectedPhoto.src, selectedPhoto.alt);
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Image
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
