import { Video } from "@/types/video";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface VideoModalProps {
  video: Video | null;
  open: boolean;
  onClose: () => void;
}

export function VideoModal({ video, open, onClose }: VideoModalProps) {
  if (!video) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] p-0 overflow-y-auto rounded-3xl">
        <DialogHeader className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6">
          <DialogTitle className="text-xl md:text-2xl font-bold pr-10 leading-relaxed">
            🎬 {video.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative w-full pt-[56.25%] bg-black">
          {video.type === "youtube" ? (
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={`https://www.youtube.com/embed/${video.src}?autoplay=1`}
              title={video.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video 
              className="absolute top-0 left-0 w-full h-full"
              controls 
              autoPlay
            >
              <source src={video.src} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
        
        <div className="p-6 bg-gradient-to-b from-background to-muted/20">
          <p className="text-center text-lg text-muted-foreground font-medium">
            👍 Enjoy learning! Click outside to close
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
