import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

interface DayData {
  day: string;
  present: number;
  absent: number;
  rate: number;
}

interface AttendanceByDayChartProps {
  data: DayData[];
  onDayClick?: (day: string) => void;
}

export function AttendanceByDayChart({ data, onDayClick }: AttendanceByDayChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="rounded-xl border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Attendance by Day of Week</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-xl">
                        <p className="text-sm font-semibold mb-2">{payload[0].payload.day}</p>
                        <p className="text-sm text-green-600">Present: {payload[0].value}</p>
                        <p className="text-sm text-red-600">Absent: {payload[1]?.value || 0}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Rate: {payload[0].payload.rate}%
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="present" 
                fill="hsl(142 76% 36%)" 
                radius={[8, 8, 0, 0]}
                onClick={(data) => onDayClick?.(data.day)}
                cursor="pointer"
              />
              <Bar 
                dataKey="absent" 
                fill="hsl(0 84% 60%)" 
                radius={[8, 8, 0, 0]}
                onClick={(data) => onDayClick?.(data.day)}
                cursor="pointer"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
