import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Performer {
  name: string;
  stream: string;
  rate: number;
  photoUrl?: string;
}

interface TopPerformersCardProps {
  bestStreams: { stream: string; rate: number }[];
  worstStreams: { stream: string; rate: number }[];
  perfectAttendance: Performer[];
  onStreamClick?: (stream: string) => void;
}

export function TopPerformersCard({ 
  bestStreams, 
  worstStreams, 
  perfectAttendance,
  onStreamClick 
}: TopPerformersCardProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Best Performing Streams */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <Card className="rounded-xl border-0 shadow-lg h-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <CardTitle>Top Performing Streams</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bestStreams.map((stream, index) => (
                <motion.div
                  key={stream.stream}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => onStreamClick?.(stream.stream)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600/10 text-green-600 font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{stream.stream}</span>
                  </div>
                  <span className="text-green-600 font-semibold">{stream.rate}%</span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Needs Improvement */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <Card className="rounded-xl border-0 shadow-lg h-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-orange-600" />
              <CardTitle>Needs Improvement</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {worstStreams.map((stream, index) => (
                <motion.div
                  key={stream.stream}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => onStreamClick?.(stream.stream)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-600/10 text-orange-600 font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{stream.stream}</span>
                  </div>
                  <span className="text-orange-600 font-semibold">{stream.rate}%</span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Perfect Attendance Students */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="lg:col-span-2"
      >
        <Card className="rounded-xl border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-600" />
              <CardTitle>Perfect Attendance Students</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {perfectAttendance.map((student, index) => (
                <motion.div
                  key={student.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-yellow-600/10 to-orange-600/10 border border-yellow-600/20"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={student.photoUrl} alt={student.name} />
                    <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{student.name}</p>
                    <p className="text-xs text-muted-foreground">{student.stream}</p>
                  </div>
                  <Award className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
