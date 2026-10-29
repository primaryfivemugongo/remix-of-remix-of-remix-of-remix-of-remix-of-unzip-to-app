import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Swords, Pause, Play } from "lucide-react";
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

interface Candidate {
  name: string;
  votes: number;
  percentage: number;
  rank: number;
}

interface BattleData {
  position: string;
  candidate1: Candidate;
  candidate2: Candidate;
  voteDifference: number;
}

interface HeadToHeadBattleProps {
  battles: BattleData[];
  onClick?: (position: string, candidate: string) => void;
}

export const HeadToHeadBattle = ({ battles, onClick }: HeadToHeadBattleProps) => {
  const plugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false })
  );
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

  if (!battles || battles.length === 0) return null;

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
          {battles.map((battle, index) => (
            <CarouselItem key={index}>
              <Card className="p-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Swords className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold text-center">Head-to-Head Battle</h2>
                </div>
                <p className="text-center text-sm text-muted-foreground mb-6">{battle.position}</p>

                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6 md:gap-8">
                  {/* Candidate 1 */}
                  <div 
                    className="text-center cursor-pointer hover:bg-accent/50 p-3 -m-3 rounded-lg transition-colors"
                    onClick={() => onClick?.(battle.position, battle.candidate1.name)}
                  >
                    <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white text-3xl shadow-lg">
                      {battle.candidate1.rank === 1 ? "👑" : "🥈"}
                    </div>
                    <h3 className="font-bold text-foreground mb-2">{battle.candidate1.name}</h3>
                    <div className="text-3xl font-bold text-primary mb-1">{battle.candidate1.votes}</div>
                    <div className="text-sm text-muted-foreground">{battle.candidate1.percentage.toFixed(1)}%</div>
                  </div>

                  {/* VS Badge */}
                  <div className="text-center">
                    <Badge className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 text-base font-bold">
                      VS
                    </Badge>
                    <div className="mt-3 text-sm text-muted-foreground whitespace-nowrap">
                      {battle.voteDifference} vote{battle.voteDifference !== 1 ? 's' : ''} difference
                    </div>
                  </div>

                  {/* Candidate 2 */}
                  <div 
                    className="text-center cursor-pointer hover:bg-accent/50 p-3 -m-3 rounded-lg transition-colors"
                    onClick={() => onClick?.(battle.position, battle.candidate2.name)}
                  >
                    <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-3xl shadow-lg">
                      {battle.candidate2.rank === 1 ? "👑" : "🥈"}
                    </div>
                    <h3 className="font-bold text-foreground mb-2">{battle.candidate2.name}</h3>
                    <div className="text-3xl font-bold text-primary mb-1">{battle.candidate2.votes}</div>
                    <div className="text-sm text-muted-foreground">{battle.candidate2.percentage.toFixed(1)}%</div>
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
