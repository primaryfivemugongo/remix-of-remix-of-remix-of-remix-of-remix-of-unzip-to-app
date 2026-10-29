import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Loader2, Download, CheckCircle } from "lucide-react";

interface DownloadProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalItems: number;
  currentItem: number;
  isComplete: boolean;
}

export function DownloadProgressModal({
  isOpen,
  onClose,
  totalItems,
  currentItem,
  isComplete
}: DownloadProgressModalProps) {
  const [currentMessage, setCurrentMessage] = useState(0);
  
  const progressMessages = [
    "Processing applications...",
    "Adjusting dimensions...", 
    "Adding student photos...",
    "Enhancing fonts...",
    "Formatting documents...",
    "Optimizing layouts...",
    "Applying school branding...",
    "Finalizing documents...",
    "Preparing download..."
  ];

  const progress = totalItems > 0 ? Math.round((currentItem / totalItems) * 100) : 0;

  // Rotate messages every 2 seconds
  useEffect(() => {
    if (!isOpen || isComplete) return;
    
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % progressMessages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isOpen, isComplete, progressMessages.length]);

  // Auto close after completion
  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isComplete, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={isComplete ? onClose : undefined}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-4">
          <div className="flex justify-center">
            {isComplete ? (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Download className="w-8 h-8 text-primary animate-pulse" />
              </div>
            )}
          </div>
          
          <DialogTitle className="text-xl">
            {isComplete ? "Download Complete!" : "Processing Applications"}
          </DialogTitle>
          
          <DialogDescription className="text-center space-y-4">
            {isComplete ? (
              <p className="text-green-600 font-medium">
                Successfully processed {totalItems} applications
              </p>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-primary font-medium">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {progressMessages[currentMessage]}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Please don't leave this page while processing is in progress
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full h-3" />
                  <p className="text-xs text-muted-foreground">
                    Processing {currentItem} of {totalItems} applications
                  </p>
                </div>
              </>
            )}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}