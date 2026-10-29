import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar as CalendarIcon, CheckCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate, useParams } from "@/lib/router-compat";
import { parseStudentCSV } from '@/utils/csvParser';
import studentsCSV from '@/data/students.csv?raw';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval } from "date-fns";
import { Progress } from "@/components/ui/progress";

const allStudents = parseStudentCSV(studentsCSV).map(row => ({
  id: row.id,
  name: row.name,
  email: row.email,
  class: row.class_id,
  stream: row.stream_id,
  photoUrl: row.photo_url
}));

type Period = 'day' | 'week' | 'month' | 'year';

const StudentAttendanceSummary = () => {
  const { userRole, userName, photoUrl, signOut } = useAuth();
  const navigate = useNavigate();
  const { studentId } = useParams();
  const student = allStudents.find(s => s.id === studentId);
  
  const [period, setPeriod] = useState<Period>('week');
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  useEffect(() => {
    if (studentId) {
      loadAttendanceData();
      loadMonthlyAttendance();
    }
  }, [studentId, period, selectedMonth]);

  const loadMonthlyAttendance = async () => {
    try {
      const monthStart = startOfMonth(selectedMonth);
      const monthEnd = endOfMonth(selectedMonth);
      
      const { data, error } = await (supabase as any)
        .from('attendance_records')
        .select('*')
        .eq('student_id', studentId)
        .gte('date', format(monthStart, 'yyyy-MM-dd'))
        .lte('date', format(monthEnd, 'yyyy-MM-dd'));
      
      if (error) throw error;
      // Data is already stored in attendanceRecords
    } catch (error) {
      console.error('Error loading monthly attendance:', error);
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

  const getDateRange = () => {
    const today = new Date();
    switch (period) {
      case 'day':
        return { start: today, end: today };
      case 'week':
        return { start: startOfWeek(today, { weekStartsOn: 1 }), end: endOfWeek(today, { weekStartsOn: 1 }) };
      case 'month':
        return { start: startOfMonth(today), end: endOfMonth(today) };
      case 'year':
        return { start: startOfYear(today), end: endOfYear(today) };
    }
  };

  const loadAttendanceData = async () => {
    setLoading(true);
    try {
      const { start, end } = getDateRange();
      
      const { data, error } = await (supabase as any)
        .from('attendance_records')
        .select('*')
        .eq('student_id', studentId)
        .gte('date', format(start, 'yyyy-MM-dd'))
        .lte('date', format(end, 'yyyy-MM-dd'))
        .order('date', { ascending: false });
      
      if (error) throw error;
      setAttendanceRecords(data || []);
    } catch (error) {
      console.error('Error loading attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!student) {
    return (
      <DashboardLayout userRole={userRole} userName={userName || "Admin"} photoUrl={photoUrl} onLogout={handleLogout}>
        <div className="p-6 text-center">
          <p className="text-muted-foreground">Student not found</p>
          <Button onClick={() => navigate('/admin/attendance')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Attendance
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const { start, end } = getDateRange();
  const allDays = eachDayOfInterval({ start, end });
  
  const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
  const absentCount = attendanceRecords.filter(r => r.status === 'absent').length;
  const totalDays = period === 'day' ? 1 : allDays.length;
  const attendanceRate = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 0;

  const getStatusBadge = (status: string) => {
    if (status === 'present') return <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200">Present</Badge>;
    if (status === 'absent') return <Badge className="bg-red-500/10 text-red-700 border-red-200">Absent</Badge>;
    return <Badge variant="outline">Not Marked</Badge>;
  };

  if (!userRole) return null;

  return (
    <DashboardLayout userRole={userRole} userName={userName || "Admin"} photoUrl={photoUrl} onLogout={handleLogout}>
      <div className="w-full max-w-full overflow-x-hidden space-y-4 sm:space-y-6 animate-fade-in px-3 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-elegant bg-clip-text text-transparent truncate">
              Attendance Summary
            </h1>
          </div>
        </div>

        {/* Student Info Card */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                <AvatarImage src={student.photoUrl} />
                <AvatarFallback className="text-lg">
                  {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold truncate">{student.name}</h2>
                <p className="text-sm text-muted-foreground truncate">{student.email}</p>
                <p className="text-xs text-muted-foreground mt-1 truncate">{student.stream.replace('-', ' - ')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Period Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">View Period:</span>
              </div>
              <Select value={period} onValueChange={(value) => setPeriod(value as Period)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  <SelectItem value="day">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">
                {format(start, 'MMM d')} - {format(end, 'MMM d, yyyy')}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold">{totalDays}</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">Total Days</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-emerald-600">{presentCount}</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">Present</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-red-600">{absentCount}</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">Absent</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">{attendanceRate}%</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">Attendance Rate</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Progress</CardTitle>
            <CardDescription>Visual representation of attendance rate</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={attendanceRate} className="h-4" />
            <p className="text-sm text-muted-foreground mt-2 text-center">
              {presentCount} out of {totalDays} days attended
            </p>
          </CardContent>
        </Card>

        {/* Monthly Calendar View */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
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
              Visual representation of monthly attendance
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
              {Array.from({ length: startOfMonth(selectedMonth).getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              
              {/* Calendar days */}
              {eachDayOfInterval({ start: startOfMonth(selectedMonth), end: endOfMonth(selectedMonth) }).map(day => {
                const attendance = attendanceRecords.find(r => 
                  format(new Date(r.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
                );
                const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                
                return (
                  <div
                    key={day.toISOString()}
                    className={`
                      aspect-square p-2 rounded-lg border transition-all
                      ${attendance 
                        ? attendance.status === 'present'
                          ? 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900'
                          : 'bg-red-50 border-red-200 hover:bg-red-100 dark:bg-red-950/30 dark:border-red-900'
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
                <div className="w-4 h-4 rounded bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900" />
                <span className="text-sm text-muted-foreground">Present</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-50 border border-red-200 dark:bg-red-950/30 dark:border-red-900" />
                <span className="text-sm text-muted-foreground">Absent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border border-border" />
                <span className="text-sm text-muted-foreground">No data</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Records */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Records</CardTitle>
            <CardDescription>Detailed attendance history for the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : attendanceRecords.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No attendance records found for this period
              </div>
            ) : (
              <div className="space-y-3">
                {attendanceRecords.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex-1">
                      <p className="font-medium">{format(new Date(record.date), 'EEEE, MMMM d, yyyy')}</p>
                      {record.absent_reason && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Reason: {record.absent_reason}
                        </p>
                      )}
                      {record.marked_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Marked at: {format(new Date(record.marked_at), 'h:mm a')}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0">
                      {getStatusBadge(record.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentAttendanceSummary;
