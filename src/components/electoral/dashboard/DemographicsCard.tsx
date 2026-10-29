import { Card } from "@/components/ui/card";
import { Users, BookOpen, BarChart3, Pause, Play } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface BreakdownItem {
  name: string;
  percentage: number;
  color: string;
}

interface DemographicsData {
  position: string;
  data?: BreakdownItem[];
  malePercentage?: number;
  femalePercentage?: number;
}

interface DemographicsCardProps {
  title: string;
  type: "gender" | "class" | "stream";
  demographics: DemographicsData[];
  onClick?: (position: string, category?: string) => void;
}

export const DemographicsCard = ({
  title,
  type,
  demographics,
  onClick
}: DemographicsCardProps) => {
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

  const getIcon = () => {
    switch (type) {
      case "gender":
        return <Users className="w-5 h-5" />;
      case "class":
        return <BookOpen className="w-5 h-5" />;
      case "stream":
        return <BarChart3 className="w-5 h-5" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    >
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
        {getIcon()}
        <h3 className="font-semibold text-foreground">{title}</h3>
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
          {demographics.map((demo, index) => (
            <CarouselItem key={index}>
              <div className="mb-2">
                <p className="text-sm font-medium text-muted-foreground">{demo.position}</p>
              </div>

              {type === "gender" && demo.malePercentage !== undefined && demo.femalePercentage !== undefined && (
                <>
                  <div className="flex h-24 rounded-lg overflow-hidden mb-4">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-400 flex items-center justify-center text-white font-semibold cursor-pointer hover:opacity-90 transition-opacity"
                      style={{ width: `${demo.malePercentage}%` }}
                      onClick={() => onClick?.(demo.position, 'male')}
                    >
                      {demo.malePercentage}% Male
                    </div>
                    <div
                      className="bg-gradient-to-r from-pink-500 to-pink-400 flex items-center justify-center text-white font-semibold cursor-pointer hover:opacity-90 transition-opacity"
                      style={{ width: `${demo.femalePercentage}%` }}
                      onClick={() => onClick?.(demo.position, 'female')}
                    >
                      {demo.femalePercentage}% Female
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Male Voters</span>
                    <span>Female Voters</span>
                  </div>
                </>
              )}

              {(type === "class" || type === "stream") && demo.data && (
                <div className="space-y-3">
                  {demo.data.map((item, idx) => (
                    <div key={idx} className="cursor-pointer hover:bg-accent/50 p-2 -m-2 rounded-lg transition-colors" onClick={() => onClick?.(demo.position, item.name)}>
                      <div className="flex justify-between mb-1 text-sm">
                        <span className="font-medium text-foreground">{item.name}</span>
                        <span className="text-muted-foreground">{item.percentage}%</span>
                      </div>
                      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            backgroundColor: item.color
                          }}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.percentage}%` }}
                          viewport={{ once: true }}
                          transition={{ 
                            duration: 1, 
                            delay: idx * 0.1,
                            ease: [0.25, 0.46, 0.45, 0.94]
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
