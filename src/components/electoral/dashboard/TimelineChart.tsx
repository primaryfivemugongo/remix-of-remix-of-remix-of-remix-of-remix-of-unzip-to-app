import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { TrendingUp, Users, Clock } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface TimelineData {
  time: string;
  votes: number;
  details?: {
    totalVoters: number;
    peakTime: boolean;
  };
}

interface TimelineChartProps {
  data: TimelineData[];
  onTimeSlotClick?: (timeSlot: string, votes: number) => void;
  isAdmin?: boolean;
  isLoading?: boolean;
}

export function TimelineChart({ data, onTimeSlotClick, isAdmin = false, isLoading = false }: TimelineChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [clickedTime, setClickedTime] = useState<string | null>(null);

  // Calculate peak voting times
  const maxVotes = Math.max(...data.map(d => d.votes), 1);
  const enhancedData = data.map(item => ({
    ...item,
    isPeak: item.votes >= maxVotes * 0.8,
    intensity: (item.votes / maxVotes) * 100
  }));

  const totalVotes = data.reduce((sum, d) => sum + d.votes, 0);
  const peakTime = data.reduce((max, d) => d.votes > max.votes ? d : max, data[0]);
  const avgVotesPerSlot = totalVotes / data.length;

  const handleClick = (entry: any, index: number) => {
    if (isAdmin && onTimeSlotClick) {
      setClickedTime(entry.time);
      onTimeSlotClick(entry.time, entry.votes);
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            {data.time}
          </p>
          <p className="text-sm mt-1">
            <span className="text-muted-foreground">Votes:</span>{" "}
            <span className="font-bold text-primary">{data.votes}</span>
          </p>
          {data.isPeak && (
            <Badge variant="default" className="mt-2 text-xs">
              Peak Hour
            </Badge>
          )}
          {isAdmin && (
            <p className="text-xs text-muted-foreground mt-2">
              Click to view voter details
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ 
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    >
      <Card className={`rounded-xl border-0 shadow-lg transition-all ${isAdmin ? 'cursor-pointer hover:shadow-xl' : ''}`}>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Voting Activity Timeline
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-green-500 text-green-600 gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                LIVE
              </Badge>
              {isAdmin && (
                <Badge variant="secondary" className="text-xs">
                  Click chart for details
                </Badge>
              )}
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Total Votes</p>
              <p className="text-lg font-bold text-primary">
                {isLoading ? <Skeleton className="h-7 w-12" /> : totalVotes}
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Peak Time</p>
              <p className="text-lg font-bold text-primary">
                {isLoading ? <Skeleton className="h-7 w-16" /> : (peakTime?.time || 'N/A')}
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Avg/Hour</p>
              <p className="text-lg font-bold text-primary">
                {isLoading ? <Skeleton className="h-7 w-12" /> : avgVotesPerSlot.toFixed(1)}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart 
              data={enhancedData}
              onClick={(e) => e?.activePayload?.[0] && handleClick(e.activePayload[0].payload, e.activeTooltipIndex || 0)}
              className={isAdmin ? 'cursor-pointer' : ''}
            >
              <defs>
                <linearGradient id="colorVotes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(221 83% 53%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(221 83% 53%)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorVotesPeak" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142 76% 36%)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="hsl(142 76% 36%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="time" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="votes" 
                stroke="hsl(221 83% 53%)" 
                strokeWidth={2}
                fill="url(#colorVotes)"
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
          
          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span className="text-muted-foreground">Regular Activity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-600" />
              <span className="text-muted-foreground">Peak Hours</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
