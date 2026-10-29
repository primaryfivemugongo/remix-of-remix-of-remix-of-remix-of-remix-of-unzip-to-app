import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, UserX, TrendingUp, Clock } from "lucide-react";
import { useNavigate } from "@/lib/router-compat";
import { Skeleton } from "@/components/ui/skeleton";

interface AttendanceStatsProps {
  totalStudents: number;
  present: number;
  absent: number;
  pending: number;
  attendanceRate: number;
  isLoading?: boolean;
}

export const AttendanceStats = ({ totalStudents, present, absent, pending, attendanceRate, isLoading = false }: AttendanceStatsProps) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 w-full min-w-0">
      <Card 
        className="hover-scale border-l-4 border-l-primary cursor-pointer transition-all hover:shadow-lg w-full min-w-0" 
        onClick={() => navigate('/admin/attendance/details?filter=all')}
      >
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Students</p>
              <h3 className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2">
                {isLoading ? <Skeleton className="h-8 w-16" /> : totalStudents}
              </h3>
            </div>
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card 
        className="hover-scale border-l-4 border-l-emerald-500 cursor-pointer transition-all hover:shadow-lg w-full min-w-0"
        onClick={() => navigate('/admin/attendance/details?filter=present')}
      >
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Present</p>
              <h3 className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 text-emerald-600">
                {isLoading ? <Skeleton className="h-8 w-16" /> : present}
              </h3>
            </div>
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
              <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card 
        className="hover-scale border-l-4 border-l-red-500 cursor-pointer transition-all hover:shadow-lg w-full min-w-0"
        onClick={() => navigate('/admin/attendance/details?filter=absent')}
      >
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Absent</p>
              <h3 className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 text-red-600">
                {isLoading ? <Skeleton className="h-8 w-16" /> : absent}
              </h3>
            </div>
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
              <UserX className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card 
        className="hover-scale border-l-4 border-l-yellow-500 cursor-pointer transition-all hover:shadow-lg w-full min-w-0"
        onClick={() => navigate('/admin/attendance/details?filter=pending')}
      >
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Pending</p>
              <h3 className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 text-yellow-600">
                {isLoading ? <Skeleton className="h-8 w-16" /> : pending}
              </h3>
            </div>
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover-scale border-l-4 border-l-blue-500 w-full min-w-0">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Attendance Rate</p>
              <h3 className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 text-blue-600">
                {isLoading ? <Skeleton className="h-8 w-20" /> : `${attendanceRate}%`}
              </h3>
            </div>
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
