import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Activity, Clock } from "lucide-react";
import { useState } from "react";

interface HeatmapData {
  hour: number;
  votes: number;
}

interface VotingHeatmapProps {
  data: HeatmapData[];
  onHourClick?: (hour: number, votes: number) => void;
  isAdmin?: boolean;
}

export function VotingHeatmap({ data, onHourClick, isAdmin = false }: VotingHeatmapProps) {
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const maxVotes = Math.max(...data.map(d => d.votes), 1);
  const totalVotes = data.reduce((sum, d) => sum + d.votes, 0);
  const peakHour = data.reduce((max, d) => d.votes > max.votes ? d : max, data[0]);

  const getIntensity = (votes: number) => {
    const percentage = (votes / maxVotes) * 100;
    if (percentage === 0) return "bg-slate-100 dark:bg-slate-800";
    if (percentage < 25) return "bg-blue-200 dark:bg-blue-900";
    if (percentage < 50) return "bg-blue-400 dark:bg-blue-700";
    if (percentage < 75) return "bg-blue-600 dark:bg-blue-500";
    return "bg-blue-800 dark:bg-blue-400";
  };

  const handleBarClick = (hour: number, votes: number) => {
    if (isAdmin && onHourClick) {
      setSelectedHour(hour);
      onHourClick(hour, votes);
    }
  };

  return (
    <Card className="rounded-xl border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Voting Activity Heatmap
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">24-hour view</span>
            {isAdmin && (
              <Badge variant="secondary" className="text-xs">
                Click bars for details
              </Badge>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Peak Hour
            </p>
            <p className="text-lg font-bold text-primary">
              {String(peakHour.hour).padStart(2, '0')}:00
            </p>
            <p className="text-xs text-muted-foreground">{peakHour.votes} votes</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Total Activity</p>
            <p className="text-lg font-bold text-primary">{totalVotes}</p>
            <p className="text-xs text-muted-foreground">votes cast</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="flex gap-1 h-24">
            {data.map((item) => (
              <Tooltip key={item.hour}>
                <TooltipTrigger asChild>
                  <div
                    onClick={() => handleBarClick(item.hour, item.votes)}
                    className={cn(
                      "flex-1 rounded-sm transition-all hover:scale-y-110 hover:shadow-md relative",
                      getIntensity(item.votes),
                      isAdmin ? "cursor-pointer" : "cursor-default",
                      selectedHour === item.hour && "ring-2 ring-primary ring-offset-2"
                    )}
                  >
                    {item.votes > 0 && item.votes === peakHour.votes && (
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-semibold">{String(item.hour).padStart(2, '0')}:00</p>
                  <p className="text-xs">{item.votes} votes</p>
                  {item.votes === peakHour.votes && item.votes > 0 && (
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                      Peak hour 🏆
                    </p>
                  )}
                  {isAdmin && item.votes > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Click to view voters
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
        <div className="flex justify-between mt-3 text-xs text-muted-foreground font-medium">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>23:59</span>
        </div>
        <div className="flex items-center justify-center gap-4 mt-4 text-xs flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-slate-100 dark:bg-slate-800 border" />
            <span className="text-muted-foreground">No activity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-400 dark:bg-blue-700" />
            <span className="text-muted-foreground">Moderate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-800 dark:bg-blue-400" />
            <span className="text-muted-foreground">High activity</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
