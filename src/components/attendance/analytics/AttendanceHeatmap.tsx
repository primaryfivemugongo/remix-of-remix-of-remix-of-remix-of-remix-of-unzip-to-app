import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useState } from "react";

interface HeatmapData {
  day: string;
  hour: number;
  attendance: number;
  color: string;
}

interface AttendanceHeatmapProps {
  data: HeatmapData[];
  onCellClick?: (day: string, hour: number) => void;
}

export function AttendanceHeatmap({ data, onCellClick }: AttendanceHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16];

  const getIntensity = (attendance: number) => {
    if (attendance >= 90) return 'bg-green-600';
    if (attendance >= 80) return 'bg-green-500';
    if (attendance >= 70) return 'bg-yellow-500';
    if (attendance >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="rounded-xl border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Weekly Attendance Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="inline-grid grid-cols-10 gap-2 min-w-max">
              {/* Header row */}
              <div className="font-medium text-sm text-muted-foreground"></div>
              {hours.map(hour => (
                <div key={hour} className="text-center font-medium text-sm text-muted-foreground">
                  {hour}:00
                </div>
              ))}
              
              {/* Data rows */}
              {days.map(day => (
                <>
                  <div key={`label-${day}`} className="font-medium text-sm text-muted-foreground flex items-center">
                    {day}
                  </div>
                  {hours.map(hour => {
                    const cellData = data.find(d => d.day === day && d.hour === hour);
                    const attendance = cellData?.attendance || 0;
                    const cellKey = `${day}-${hour}`;
                    
                    return (
                      <motion.div
                        key={cellKey}
                        className={`h-12 rounded cursor-pointer ${getIntensity(attendance)} relative`}
                        onClick={() => onCellClick?.(day, hour)}
                        onMouseEnter={() => setHoveredCell(cellKey)}
                        onMouseLeave={() => setHoveredCell(null)}
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {hoveredCell === cellKey && (
                          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-background border rounded-lg p-2 shadow-xl z-10 whitespace-nowrap">
                            <p className="text-xs font-semibold">{day} {hour}:00</p>
                            <p className="text-xs text-muted-foreground">{attendance}% attendance</p>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </>
              ))}
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <span className="text-xs text-muted-foreground">Low</span>
            <div className="flex gap-1">
              <div className="w-6 h-6 bg-red-500 rounded"></div>
              <div className="w-6 h-6 bg-orange-500 rounded"></div>
              <div className="w-6 h-6 bg-yellow-500 rounded"></div>
              <div className="w-6 h-6 bg-green-500 rounded"></div>
              <div className="w-6 h-6 bg-green-600 rounded"></div>
            </div>
            <span className="text-xs text-muted-foreground">High</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
