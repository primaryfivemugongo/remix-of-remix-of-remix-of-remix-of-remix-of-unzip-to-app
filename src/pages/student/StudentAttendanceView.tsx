import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  Download,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  BarChart3
} from "lucide-react";
import { format, addDays, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { parseStudentCSV } from '@/utils/csvParser';
import studentsCSV from '@/data/students.csv?raw';
import { supabase } from "@/integrations/supabase/client";

// Parse student data
const allStudents = parseStudentCSV(studentsCSV).map(row => ({
  id: row.id,
  name: row.name,
  email: row.email,
  class: row.class_id,
  stream: row.stream_id,
  photoUrl: row.photo_url
}));

interface AttendanceRecord {
  date: Date;
  status: string;
  timeMarked: string;
}

const StudentAttendanceView = () => {
  const { userRole, userName, photoUrl, signOut, userId } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  
  // Find current student from user ID
  const currentStudent = allStudents.find(s => s.id === userId) || allStudents[0];
  
  // Load attendance from database
  useEffect(() => {
    loadAttendance();
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel('student-attendance-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance_records',
          filter: `student_id=eq.${currentStudent.id}`
        },
        () => {
          loadAttendance();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentStudent.id, selectedMonth]);
  
  const loadAttendance = async () => {
    try {
      const monthStart = startOfMonth(selectedMonth);
      const monthEnd = endOfMonth(selectedMonth);
      
      const { data, error } = await (supabase as any)
        .from('attendance_records')
        .select('*')
        .eq('student_id', currentStudent.id)
        .gte('date', format(monthStart, 'yyyy-MM-dd'))
        .lte('date', format(monthEnd, 'yyyy-MM-dd'));
      
      if (error) throw error;
      
      const records: AttendanceRecord[] = data?.map((record: any) => ({
        date: new Date(record.date),
        status: record.status,
        timeMarked: record.marked_at || record.created_at
      })) || [];
      
      setAttendanceHistory(records);
    } catch (error) {
      console.error('Error loading attendance:', error);
    }
  };
  
  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setSelectedMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'next') {
        newDate.setMonth(prev.getMonth() + 1);
      } else {
        newDate.setMonth(prev.getMonth() - 1);
      }
      return newDate;
    });
  };

  // Calculate statistics
  const totalDays = attendanceHistory.length;
  const presentDays = attendanceHistory.filter(a => a.status === 'present').length;
  const absentDays = attendanceHistory.filter(a => a.status === 'absent').length;
  const attendanceRate = Math.round((presentDays / totalDays) * 100);

  // Get streak
  let currentStreak = 0;
  for (let i = attendanceHistory.length - 1; i >= 0; i--) {
    if (attendanceHistory[i].status === 'present') {
      currentStreak++;
    } else {
      break;
    }
  }

  // Calendar view
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getStatusColor = (status: string) => {
    return status === 'present' 
      ? 'bg-emerald-500 hover:bg-emerald-600' 
      : 'bg-red-500 hover:bg-red-600';
  };

  const getAttendanceForDay = (day: Date) => {
    return attendanceHistory.find(a => 
      format(a.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
    );
  };

  if (!userRole) return null;

  return (
    <DashboardLayout
      userRole={userRole}
      userName={userName || "Student"}
      photoUrl={photoUrl}
      onLogout={handleLogout}
    >
      <div className="space-y-6 animate-fade-in px-2 md:px-0">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-elegant bg-clip-text text-transparent">
              My Attendance
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Track your attendance record and performance
            </p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>

        {/* Student Info Card */}
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              {currentStudent.photoUrl ? (
                <img 
                  src={currentStudent.photoUrl} 
                  alt={currentStudent.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                  <span className="text-xl font-bold">
                    {currentStudent.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-xl font-bold">{currentStudent.name}</h3>
                <p className="text-sm text-muted-foreground">{currentStudent.email}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">{currentStudent.class}</Badge>
                  <Badge variant="outline">{currentStudent.stream}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover-scale">
            <CardContent className="p-4 md:p-6">
              <div className="text-center">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Calendar className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <div className="text-2xl md:text-3xl font-bold">{totalDays}</div>
                <div className="text-xs md:text-sm text-muted-foreground mt-1">Total Days</div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-scale">
            <CardContent className="p-4 md:p-6">
              <div className="text-center">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-emerald-600" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-emerald-600">{presentDays}</div>
                <div className="text-xs md:text-sm text-muted-foreground mt-1">Present</div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-scale">
            <CardContent className="p-4 md:p-6">
              <div className="text-center">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-3">
                  <XCircle className="h-5 w-5 md:h-6 md:w-6 text-red-600" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-red-600">{absentDays}</div>
                <div className="text-xs md:text-sm text-muted-foreground mt-1">Absent</div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-scale">
            <CardContent className="p-4 md:p-6">
              <div className="text-center">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-blue-600">{currentStreak}</div>
                <div className="text-xs md:text-sm text-muted-foreground mt-1">Day Streak</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Rate Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Overall Attendance Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-4xl font-bold">{attendanceRate}%</span>
              {attendanceRate >= 75 ? (
                <Badge className="bg-emerald-600 text-white">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Good Standing
                </Badge>
              ) : (
                <Badge className="bg-red-600 text-white">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Below Required
                </Badge>
              )}
            </div>
            <Progress value={attendanceRate} className="h-3" />
            <p className="text-sm text-muted-foreground">
              {attendanceRate >= 75 
                ? "Great job! You're maintaining the required 75% attendance."
                : "Your attendance is below the required 75%. Please improve your attendance."}
            </p>
          </CardContent>
        </Card>

        {/* Monthly Calendar View */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Attendance Calendar
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-semibold min-w-[120px] text-center">
                  {format(selectedMonth, 'MMMM yyyy')}
                </span>
                <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardDescription>
              Visual representation of your monthly attendance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-semibold text-muted-foreground p-2">
                  {day}
                </div>
              ))}
              
              {/* Empty cells for days before month starts */}
              {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              
              {/* Calendar days */}
              {monthDays.map(day => {
                const attendance = getAttendanceForDay(day);
                const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                
                return (
                  <div
                    key={day.toISOString()}
                    className={`
                      aspect-square p-2 rounded-lg border transition-all
                      ${attendance 
                        ? attendance.status === 'present'
                          ? 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-red-50 border-red-200 hover:bg-red-100'
                        : 'bg-background border-border hover:bg-accent/20'
                      }
                      ${isToday ? 'ring-2 ring-primary' : ''}
                    `}
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      <span className={`text-sm font-semibold ${isToday ? 'text-primary' : ''}`}>
                        {format(day, 'd')}
                      </span>
                      {attendance && (
                        <div className="mt-1">
                          {attendance.status === 'present' ? (
                            <CheckCircle className="h-3 w-3 text-emerald-600" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-600" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-emerald-50 border border-emerald-200" />
                <span className="text-sm text-muted-foreground">Present</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-50 border border-red-200" />
                <span className="text-sm text-muted-foreground">Absent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border border-border" />
                <span className="text-sm text-muted-foreground">No data</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Attendance History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Attendance
            </CardTitle>
            <CardDescription>
              Your attendance records from the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {attendanceHistory.slice(-7).reverse().map((record, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${record.status === 'present' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <div>
                      <p className="font-semibold">
                        {format(record.date, 'EEEE, MMM d, yyyy')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Marked at {format(new Date(record.timeMarked), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    className={
                      record.status === 'present'
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }
                  >
                    {record.status === 'present' ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <XCircle className="h-3 w-3 mr-1" />
                    )}
                    {record.status === 'present' ? 'Present' : 'Absent'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentAttendanceView;
