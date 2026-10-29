import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowDown } from 'lucide-react';
import { getPhotos, shuffleArray } from '@/utils/galleryUtils';
import { Button } from './button';

export interface PhotoJumbotronRef {
  refreshPhotos: () => Promise<void>;
}

interface PhotoJumbotronProps {
  onScrollDown?: () => void;
}

const transitions = [
  'transition-opacity duration-1000 ease-in-out',
  'transition-all duration-700 ease-out',
  'transition-transform duration-1000 ease-in-out',
];

const animations = [
  { enter: 'opacity-0', active: 'opacity-100', exit: 'opacity-0' },
  { enter: 'scale-95 opacity-0', active: 'scale-100 opacity-100', exit: 'scale-105 opacity-0' },
  { enter: 'translate-x-full', active: 'translate-x-0', exit: '-translate-x-full' },
  { enter: '-translate-x-full', active: 'translate-x-0', exit: 'translate-x-full' },
  { enter: 'translate-y-10 opacity-0', active: 'translate-y-0 opacity-100', exit: '-translate-y-10 opacity-0' },
];

export const PhotoJumbotron = forwardRef<PhotoJumbotronRef, PhotoJumbotronProps>(({ onScrollDown }, ref) => {
  const [photos, setPhotos] = useState<Array<{ src: string; alt: string }>>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState(animations[0]);

  const loadRandomPhotos = async () => {
    const allPhotos = await getPhotos();
    const shuffled = shuffleArray(allPhotos);
    const selectedPhotos = shuffled.slice(0, 5).map(photo => ({
      src: photo.src,
      alt: photo.alt
    }));
    setPhotos(selectedPhotos);
    setCurrentIndex(0);
  };

  useEffect(() => {
    loadRandomPhotos();
  }, []);

  useEffect(() => {
    if (photos.length === 0) return;

    const interval = setInterval(() => {
      goToNext();
    }, 5000); // Auto-swipe every 5 seconds

    return () => clearInterval(interval);
  }, [photos, currentIndex]);

  const getRandomAnimation = () => {
    return animations[Math.floor(Math.random() * animations.length)];
  };

  const goToNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentAnimation(getRandomAnimation());
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
      setIsTransitioning(false);
    }, 100);
  };

  const goToPrevious = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentAnimation(getRandomAnimation());
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
      setIsTransitioning(false);
    }, 100);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentAnimation(getRandomAnimation());
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 100);
  };

  useImperativeHandle(ref, () => ({
    refreshPhotos: loadRandomPhotos
  }));

  if (photos.length === 0) {
    return (
      <div className="relative w-full h-64 md:h-80 lg:h-96 bg-muted animate-pulse rounded-xl" />
    );
  }

  return (
    <div className="relative w-full h-[400px] overflow-hidden rounded-xl shadow-2xl group bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Photos with overlay gradient */}
      <div className="relative w-full h-full">
        {photos.map((photo, index) => (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out ${
              index === currentIndex
                ? `${currentAnimation.active} z-10`
                : index === (currentIndex - 1 + photos.length) % photos.length
                ? `${currentAnimation.exit} z-0`
                : `${currentAnimation.enter} z-0`
            }`}
          >
            <img
              src={photo.src}
              alt={photo.alt}
              className="w-full h-full object-cover"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
            {/* Professional gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30" />
          </div>
        ))}
      </div>

      {/* Navigation Arrows - Clean glassmorphism design */}
      <Button
        variant="ghost"
        size="icon"
        onClick={goToPrevious}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
        disabled={isTransitioning}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={goToNext}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
        disabled={isTransitioning}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Modern dot indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full">
        {photos.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-white w-8 h-2'
                : 'bg-white/50 hover:bg-white/75 w-2 h-2'
            }`}
            disabled={isTransitioning}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Animated Scroll Down Arrow */}
      {onScrollDown && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onScrollDown}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 h-12 w-12 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/40 hover:bg-white/30 text-white transition-all duration-300 hover:scale-110 animate-[float_3s_ease-in-out_infinite] pointer-events-auto cursor-pointer"
          aria-label="Scroll to content"
        >
          <ArrowDown className="h-7 w-7" strokeWidth={2.5} />
        </Button>
      )}
    </div>
  );
});
