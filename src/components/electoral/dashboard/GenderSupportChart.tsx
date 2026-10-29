import { Card } from "@/components/ui/card";
import { Users, Pause, Play } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface CandidateGenderSupport {
  candidateName: string;
  maleSupport: number; // percentage
  femaleSupport: number; // percentage
}

interface PositionGenderSupport {
  position: string;
  candidates: CandidateGenderSupport[];
}

interface GenderSupportChartProps {
  data: PositionGenderSupport[];
  onClick?: (position: string, candidate: string) => void;
}

export const GenderSupportChart = ({ data, onClick }: GenderSupportChartProps) => {
  const plugin = useRef(Autoplay({ delay: 4000, stopOnInteraction: false }));
  const [isPlaying, setIsPlaying] = useState(true);

  const handleMouseEnter = () => {
    plugin.current.stop();
    setIsPlaying(false);
  };

  const handleMouseLeave = () => {
    plugin.current.play();
    setIsPlaying(true);
  };

  const handleTouchStart = () => {
    plugin.current.stop();
    setIsPlaying(false);
  };

  const toggleAutoplay = () => {
    if (isPlaying) {
      plugin.current.stop();
    } else {
      plugin.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    >
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
        <Users className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold">Gender Support Across Candidates</h2>
      </div>

      <div className="relative">
        <div className="absolute top-2 right-2 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleAutoplay}
            className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
            aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
        </div>
        <Carousel
          opts={{ loop: true }}
          plugins={[plugin.current]}
          className="w-full"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
        >
        <CarouselContent>
          {data.map((positionData, posIndex) => (
            <CarouselItem key={posIndex}>
              <div className="mb-4">
                <p className="text-sm font-medium text-muted-foreground">{positionData.position}</p>
              </div>

              <div className="flex justify-around items-end h-64 px-4 mb-6">
                {positionData.candidates.map((candidate, index) => (
                  <div 
                    key={index} 
                    className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => onClick?.(positionData.position, candidate.candidateName)}
                  >
                    <div className="flex flex-col items-center h-48 justify-end">
                      {/* Male bar */}
                      <motion.div
                        className="w-8 bg-blue-500 rounded-t mb-1"
                        initial={{ height: 0 }}
                        whileInView={{ height: `${candidate.maleSupport * 1.5}px` }}
                        viewport={{ once: true }}
                        transition={{ 
                          duration: 0.7, 
                          delay: index * 0.1,
                          ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                      />
                      {/* Female bar */}
                      <motion.div
                        className="w-8 bg-pink-500"
                        initial={{ height: 0 }}
                        whileInView={{ height: `${candidate.femaleSupport * 1.5}px` }}
                        viewport={{ once: true }}
                        transition={{ 
                          duration: 0.7, 
                          delay: index * 0.1 + 0.2,
                          ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                      />
                    </div>
                    <div className="text-sm font-semibold text-center mt-3 text-foreground max-w-[100px]">
                      {candidate.candidateName}
                    </div>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded" />
                  <span className="text-muted-foreground">Male Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-pink-500 rounded" />
                  <span className="text-muted-foreground">Female Support</span>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
      </div>
    </Card>
    </motion.div>
  );
};
