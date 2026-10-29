import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useRef } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Pause, Play } from "lucide-react";

interface CandidateData {
  candidate: string;
  votes: number;
}

interface PositionCandidateData {
  position: string;
  candidates: CandidateData[];
}

interface CandidateGroupedChartProps {
  data: PositionCandidateData[];
}

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function CandidateGroupedChart({ data }: CandidateGroupedChartProps) {
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");
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
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ 
        duration: 0.6,
        delay: 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    >
      <Card>
        <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Votes by Candidate</CardTitle>
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="chart" className="text-xs">Chart</TabsTrigger>
              <TabsTrigger value="table" className="text-xs">Table</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
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

                {viewMode === "table" ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Candidate</TableHead>
                          <TableHead>Votes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {positionData.candidates.map((candidate, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{candidate.candidate}</TableCell>
                            <TableCell>{candidate.votes}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={positionData.candidates}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis 
                        dataKey="candidate" 
                        stroke="hsl(var(--muted-foreground))"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "0.5rem"
                        }}
                      />
                      <Bar
                        dataKey="votes"
                        fill={CHART_COLORS[posIndex % CHART_COLORS.length]}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </Carousel>
        </div>
      </CardContent>
    </Card>
    </motion.div>
  );
}
