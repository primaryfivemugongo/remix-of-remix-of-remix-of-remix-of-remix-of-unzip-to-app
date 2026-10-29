import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, TrendingUp, Pause, Play } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface LeaderData {
  candidateName: string;
  candidatePhoto?: string;
  position: string;
  totalVotes: number;
  voteShare: number;
  voteMargin: number;
  raceStatus: "comfortable" | "tight" | "close";
}

interface LeaderSpotlightProps {
  leaders: LeaderData[];
  onVoteClick?: (position: string, candidateName: string) => void;
}

export const LeaderSpotlight = ({ leaders, onVoteClick }: LeaderSpotlightProps) => {
  const plugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false })
  );
  const [isPlaying, setIsPlaying] = useState(true);

  const statusConfig = {
    comfortable: { label: "Comfortable Lead", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
    tight: { label: "Tight Race", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
    close: { label: "Very Close", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" }
  };

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

  if (!leaders || leaders.length === 0) return null;

  return (
    <div className="relative">
        <Carousel
          opts={{ loop: true }}
          plugins={[plugin.current]}
          className="w-full"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
        >
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
        <CarouselContent>
          {leaders.map((leader, index) => (
            <CarouselItem key={index}>
              <Card className="p-6 bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-950/20 dark:to-background border-2 border-yellow-400 dark:border-yellow-600 shadow-lg relative overflow-hidden">
                {/* Decorative crown background */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                  <Crown className="w-full h-full text-yellow-500" />
                </div>

                <div className="relative">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                      <Crown className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                      <h2 className="text-xl font-bold text-foreground">Current Leader Spotlight</h2>
                    </div>
                    <Badge className={statusConfig[leader.raceStatus].className}>
                      {statusConfig[leader.raceStatus].label}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
                    {/* Leader Profile */}
                    <div className="text-center">
                      <div className="w-28 h-28 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg overflow-hidden">
                        {leader.candidatePhoto ? (
                          <img 
                            src={leader.candidatePhoto} 
                            alt={leader.candidateName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Crown className="w-16 h-16 text-white" />
                        )}
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-1">{leader.candidateName}</h3>
                      <p className="text-muted-foreground">{leader.position}</p>
                    </div>

                    {/* Leader Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div 
                        className={`text-center p-4 bg-white dark:bg-card rounded-lg shadow-sm border ${onVoteClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
                        onClick={() => onVoteClick?.(leader.position, leader.candidateName)}
                      >
                        <div className="text-3xl font-bold text-foreground mb-1">{leader.totalVotes}</div>
                        <div className="text-sm text-muted-foreground">Total Votes</div>
                      </div>
                      <div className="text-center p-4 bg-white dark:bg-card rounded-lg shadow-sm border">
                        <div className="text-3xl font-bold text-foreground mb-1">{leader.voteShare.toFixed(1)}%</div>
                        <div className="text-sm text-muted-foreground">Vote Share</div>
                      </div>
                      <div className="text-center p-4 bg-white dark:bg-card rounded-lg shadow-sm border">
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1 flex items-center justify-center gap-1">
                          <TrendingUp className="w-6 h-6" />
                          +{leader.voteMargin}
                        </div>
                        <div className="text-sm text-muted-foreground">Vote Margin</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
    </div>
  );
};
