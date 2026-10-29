import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AnimatedButton } from '@/components/ui/animated-button';
import { PhotoQuote } from '@/utils/photoQuotes';
import { 
  Download, 
  Share2, 
  RefreshCw, 
  X, 
  Copy
} from 'lucide-react';
import { toast } from 'sonner';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: PhotoQuote;
  onNewQuote: () => void;
}

export function QuoteModal({ isOpen, onClose, quote, onNewQuote }: QuoteModalProps) {
  
  const handleShare = async (platform?: 'facebook' | 'twitter' | 'copy') => {
    const shareText = "Check out this inspiring quote!";
    const shareUrl = window.location.href;
    
    try {
      if (platform === 'facebook') {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
          '_blank'
        );
      } else if (platform === 'twitter') {
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
          '_blank'
        );
      } else if (platform === 'copy') {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard! 📋");
      } else {
        // Native share API
        if (navigator.share) {
          await navigator.share({
            title: 'Inspiring Quote',
            text: shareText,
            url: shareUrl
          });
        } else {
          // Fallback to copy
          await navigator.clipboard.writeText(shareUrl);
          toast.success("Link copied to clipboard! 📋");
        }
      }
    } catch (error) {
      console.log('Share failed:', error);
      toast.error("Sharing failed. Please try again.");
    }
  };

  const handleDownload = () => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.crossOrigin = 'anonymous';
      img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          
          // Convert to blob and download
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `quote-${Date.now()}.jpg`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
              
              toast.success("Quote downloaded! 📥");
            }
          }, 'image/jpeg', 0.8);
        }
      };
      
      img.onerror = () => {
        toast.error("Download failed. Please try again.");
      };
      
      img.src = quote.src;
    } catch (error) {
      console.log('Download failed:', error);
      toast.error("Download failed. Please try again.");
    }
  };

  const handleNewQuote = () => {
    onNewQuote();
    toast.success("New quote loaded! ✨");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 bg-background/95 backdrop-blur-sm border-2 border-primary/20">
        <div className="relative">
          
          {/* Quote Image */}
          <div className="relative">
            <img
              src={quote.src}
              alt={quote.alt}
              className="w-full h-auto max-h-[70vh] object-contain rounded-t-lg"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-t-lg" />
          </div>
          
          {/* Action Buttons */}
          <div className="p-6 space-y-4 bg-background/90 backdrop-blur-sm rounded-b-lg">
            <div className="flex flex-wrap gap-3 justify-center">
              {/* Share Options */}
              <div className="flex gap-2">
                <AnimatedButton
                  variant="outline"
                  size="sm"
                  animation="bounce"
                  onClick={() => handleShare()}
                  className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 font-semibold"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </AnimatedButton>
                
              </div>
              
              {/* Download Button */}
              <AnimatedButton
                variant="outline"
                size="sm"
                animation="bounce"
                onClick={handleDownload}
                className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700 font-semibold"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </AnimatedButton>
              
              {/* New Quote Button */}
              <AnimatedButton
                variant="default"
                size="sm"
                animation="rainbow"
                playAnimation={true}
                onClick={handleNewQuote}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                New Quote
              </AnimatedButton>
            </div>
            
            <p className="text-center text-sm text-muted-foreground">
              Click and hold to save • Share to inspire others • Get a fresh quote anytime
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}