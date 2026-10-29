import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, ChevronLeft, ChevronRight, Users, TrendingUp, BarChart3, Clock, AlertCircle, Download } from "lucide-react";
import { ProgressModal } from "@/components/ui/progress-modal";
import { generateAttendancePDF } from '@/utils/pdfGenerator';
import { toast } from "sonner";
import { AttendanceStats } from "@/components/attendance/AttendanceStats";
import { ClassAttendanceTable } from "@/components/attendance/ClassAttendanceTable";
import { AttendanceByGenderChart } from "@/components/attendance/analytics/AttendanceByGenderChart";
import { AttendanceByDayChart } from "@/components/attendance/analytics/AttendanceByDayChart";
import { AttendanceByStreamChart } from "@/components/attendance/analytics/AttendanceByStreamChart";
import { AttendanceTrendChart } from "@/components/attendance/analytics/AttendanceTrendChart";
import { AttendanceHeatmap } from "@/components/attendance/analytics/AttendanceHeatmap";
import { MonthlyComparisonChart } from "@/components/attendance/analytics/MonthlyComparisonChart";
import { TopPerformersCard } from "@/components/attendance/analytics/TopPerformersCard";
import { AttendanceQuickStats } from "@/components/attendance/analytics/AttendanceQuickStats";
import { format, addDays, subDays, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";
import { useNavigate } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";

const AttendanceOverview = () => {
  const { userRole, userName, photoUrl, signOut } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(() => {
    // Initialize to most recent weekday (Monday-Friday)
    let date = new Date();
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0) { // Sunday
      date = addDays(date, -2); // Go back to Friday
    } else if (dayOfWeek === 6) { // Saturday
      date = addDays(date, -1); // Go back to Friday
    }
    return date;
  });
  const [attendanceData, setAttendanceData] = useState<any>({});
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [classList, setClassList] = useState<any[]>([]);
  const [totalStudentsCount, setTotalStudentsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [pdfStatusMessage, setPdfStatusMessage] = useState("");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  // Load students from database
  useEffect(() => {
    loadStudents();
  }, []);
  
  // Load attendance from database
  useEffect(() => {
    if (allStudents.length > 0) {
      loadAttendance();
    }
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel('attendance-overview-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance_records'
        },
        () => {
          loadAttendance();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedDate, allStudents]);

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      
      // Use count query to get total students
      const { count: totalCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });
      
      setTotalStudentsCount(totalCount || 0);
      
      // Load students in batches to bypass 1000 row limit
      let allStudentsData: any[] = [];
      let from = 0;
      const batchSize = 1000;
      let hasMore = true;
      
      while (hasMore) {
        const { data: batch, error } = await supabase
          .from('students')
          .select('id, name, email, class_id, stream_id, photo_url, gender')
          .order('class_id')
          .order('stream_id')
          .order('name')
          .range(from, from + batchSize - 1);
        
        if (error) throw error;
        
        if (batch && batch.length > 0) {
          allStudentsData = [...allStudentsData, ...batch];
          from += batchSize;
          hasMore = batch.length === batchSize;
        } else {
          hasMore = false;
        }
      }
      
      const formattedStudents = allStudentsData.map(s => ({
        id: s.id,
        name: s.name,
        email: s.email,
        class: s.class_id,
        stream: s.stream_id,
        photoUrl: s.photo_url,
        gender: s.gender
      }));
      
      setAllStudents(formattedStudents);
      
      // Build class list from database students
      const classMap = new Map();
      formattedStudents.forEach(student => {
        if (!classMap.has(student.stream)) {
          classMap.set(student.stream, {
            id: student.stream,
            name: student.stream.replace('-', ' - '),
            students: []
          });
        }
        classMap.get(student.stream).students.push(student);
      });
      setClassList(Array.from(classMap.values()).sort((a, b) => a.id.localeCompare(b.id)));
      
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadAttendance = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('attendance_records')
        .select('*')
        .eq('date', format(selectedDate, 'yyyy-MM-dd'));
      
      if (error) throw error;
      
      const attendance: any = {};
      data?.forEach((record: any) => {
        attendance[record.student_id] = {
          status: record.status,
          timeMarked: record.marked_at || record.created_at
        };
      });
      setAttendanceData(attendance);
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

  const navigateDate = (direction: 'prev' | 'next') => {
    let newDate = addDays(selectedDate, direction === 'next' ? 1 : -1);
    
    // Skip weekends - if landing on Saturday or Sunday, move to Friday or Monday
    const dayOfWeek = newDate.getDay();
    if (dayOfWeek === 0) { // Sunday
      newDate = addDays(newDate, direction === 'next' ? 1 : -2); // Move to Monday or Friday
    } else if (dayOfWeek === 6) { // Saturday
      newDate = addDays(newDate, direction === 'next' ? 2 : -1); // Move to Monday or Friday
    }
    
    setSelectedDate(newDate);
  };

  // Calculate overall statistics using the count from database
  const presentCount = Object.values(attendanceData).filter((a: any) => a.status === 'present').length;
  const absentCount = Object.values(attendanceData).filter((a: any) => a.status === 'absent').length;
  const pendingCount = Object.values(attendanceData).filter((a: any) => a.status === 'not-marked').length;
  const attendanceRate = totalStudentsCount > 0 ? Math.round((presentCount / totalStudentsCount) * 100) : 0;

  // Calculate class-wise data
  const classData = classList.map(cls => {
    const classStudents = cls.students;
    const present = classStudents.filter(s => attendanceData[s.id]?.status === 'present').length;
    const absent = classStudents.filter(s => attendanceData[s.id]?.status === 'absent').length;
    
    return {
      id: cls.id,
      name: cls.name,
      totalStudents: classStudents.length,
      present,
      absent,
      attendanceRate: Math.round((present / classStudents.length) * 100)
    };
  });

  const handleClassClick = (classId: string) => {
    navigate(`/admin/attendance/details?class=${classId}`);
  };

  const handleGenerateReport = async () => {
    try {
      setIsGeneratingPdf(true);
      setPdfProgress(0);
      setPdfStatusMessage("Fetching all student records...");
      
      // Fetch ALL students using batching to bypass 1000 limit
      let allStudentsForReport: any[] = [];
      let from = 0;
      const batchSize = 1000;
      let hasMore = true;
      
      while (hasMore) {
        const { data: batch, error } = await supabase
          .from('students')
          .select('id, name, email, class_id, stream_id, photo_url, gender')
          .order('class_id')
          .order('stream_id')
          .order('name')
          .range(from, from + batchSize - 1);
        
        if (error) throw error;
        
        if (batch && batch.length > 0) {
          allStudentsForReport = [...allStudentsForReport, ...batch];
          from += batchSize;
          hasMore = batch.length === batchSize;
          setPdfProgress(Math.min(20, Math.floor((from / 5000) * 20)));
          setPdfStatusMessage(`Loading students... (${allStudentsForReport.length} loaded)`);
        } else {
          hasMore = false;
        }
      }
      
      setPdfProgress(30);
      setPdfStatusMessage("Preparing attendance data...");
      
      await new Promise(resolve => setTimeout(resolve, 300));
      setPdfProgress(40);

      // Prepare students data with attendance status
      setPdfStatusMessage("Compiling student records...");
      const studentsWithAttendance = allStudentsForReport.map(student => ({
        name: student.name,
        gender: student.gender || 'N/A',
        stream: student.stream_id,
        status: attendanceData[student.id]?.status || 'not-marked',
        timeMarked: attendanceData[student.id]?.timeMarked,
        photoUrl: student.photo_url
      }));

      setPdfProgress(60);
      setPdfStatusMessage("Generating PDF document...");
      
      const pdf = await generateAttendancePDF(
        studentsWithAttendance,
        selectedDate
      );
      
      setPdfProgress(90);
      setPdfStatusMessage("Finalizing PDF...");
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      pdf.save(`attendance-report-${format(selectedDate, 'yyyy-MM-dd')}.pdf`);
      
      setPdfProgress(100);
      setPdfStatusMessage("PDF generated successfully!");
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`Attendance report downloaded successfully! (${studentsWithAttendance.length} students included)`);
      
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgress(0);
    }
  };

  // Calculate analytics data from real database
  const analyticsData = useMemo(() => {
    // Gender data from actual database
    const maleStudents = allStudents.filter(s => s.gender?.toLowerCase() === 'male' || s.gender?.toLowerCase() === 'm');
    const femaleStudents = allStudents.filter(s => s.gender?.toLowerCase() === 'female' || s.gender?.toLowerCase() === 'f');
    const malePresent = maleStudents.filter(s => attendanceData[s.id]?.status === 'present').length;
    const femalePresent = femaleStudents.filter(s => attendanceData[s.id]?.status === 'present').length;
    const genderData = [
      { name: 'Male', value: malePresent, percentage: maleStudents.length > 0 ? Math.round((malePresent / maleStudents.length) * 100) : 50 },
      { name: 'Female', value: femalePresent, percentage: femaleStudents.length > 0 ? Math.round((femalePresent / femaleStudents.length) * 100) : 50 }
    ];

    // Day of week data - current day only (real data)
    const currentDay = format(selectedDate, 'EEE');
    const dayData = [
      { 
        day: currentDay, 
        present: presentCount, 
        absent: absentCount, 
        rate: attendanceRate 
      }
    ];

    // Stream data (real data)
    const streamData = classData.map(cls => ({
      stream: cls.name,
      present: cls.present,
      total: cls.totalStudents,
      rate: cls.attendanceRate
    }));

    // Trend data - using current day data
    const trendData = [{
      date: format(selectedDate, 'MM/dd'),
      rate: attendanceRate,
      present: presentCount,
      total: totalStudentsCount
    }];

    // Heatmap data - simplified for current day
    const heatmapData = [];
    const days = [format(selectedDate, 'EEE')];
    const currentHour = new Date().getHours();
    const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16];
    for (const day of days) {
      for (const hour of hours) {
        heatmapData.push({
          day,
          hour,
          attendance: hour <= currentHour ? attendanceRate : 0,
          color: ''
        });
      }
    }

    // Monthly data - using current month data
    const currentMonth = format(selectedDate, 'MMM');
    const monthData = [
      { 
        month: currentMonth, 
        avgRate: attendanceRate, 
        present: presentCount, 
        absent: absentCount 
      }
    ];

    // Top and bottom performers (real data)
    const sortedStreams = [...streamData].sort((a, b) => b.rate - a.rate);
    const bestStreams = sortedStreams.slice(0, 5).map(s => ({ stream: s.stream, rate: s.rate }));
    const worstStreams = sortedStreams.slice(-5).reverse().map(s => ({ stream: s.stream, rate: s.rate }));

    // Perfect attendance students (real data - students marked present)
    const perfectAttendance = allStudents
      .filter(s => attendanceData[s.id]?.status === 'present')
      .slice(0, 6)
      .map(s => ({
        name: s.name,
        stream: s.stream,
        rate: 100,
        photoUrl: s.photoUrl
      }));

    return {
      genderData,
      dayData,
      streamData,
      trendData,
      heatmapData,
      monthData,
      bestStreams,
      worstStreams,
      perfectAttendance
    };
  }, [classData, presentCount, absentCount, totalStudentsCount, allStudents, selectedDate, attendanceData, attendanceRate]);

  // Quick stats
  const quickStats = [
    { icon: Users, value: totalStudentsCount, label: 'Total Students' },
    { icon: TrendingUp, value: `${attendanceRate}%`, label: 'Today\'s Rate', trend: 2.5 },
    { icon: BarChart3, value: analyticsData.bestStreams[0]?.rate + '%' || 'N/A', label: 'Best Stream' },
    { icon: Clock, value: format(selectedDate, 'MMM d'), label: 'Current Date' }
  ];

  if (!userRole || isLoading) return null;

  return (
    <DashboardLayout
      userRole={userRole}
      userName={userName || "Admin"}
      photoUrl={photoUrl}
      onLogout={handleLogout}
    >
      <div className="w-full min-w-0 space-y-4 sm:space-y-6 animate-fade-in px-2 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-elegant bg-clip-text text-transparent truncate">
              Attendance Overview
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Monitor and analyze attendance across the entire school
            </p>
          </div>
        </div>

        {/* Date Selection and Report Button */}
        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-2 shrink-0">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  <span className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">Viewing Date:</span>
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <Button variant="outline" size="sm" onClick={() => navigateDate('prev')} className="shrink-0">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="font-semibold text-xs sm:text-sm text-center min-w-0 truncate sm:whitespace-nowrap px-2">
                    {format(selectedDate, 'EEE, MMM d, yyyy')}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => navigateDate('next')} className="shrink-0">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleGenerateReport} size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Attendance Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekend Info Banner */}
        {selectedDate.getDay() === 0 || selectedDate.getDay() === 6 ? (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                <p className="text-xs sm:text-sm font-medium">
                  Weekend Day - Attendance is only tracked Monday through Friday
                </p>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Tabs for different views */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Statistics Cards */}
            <AttendanceStats
              totalStudents={totalStudentsCount}
              present={presentCount}
              absent={absentCount}
              pending={pendingCount}
              attendanceRate={attendanceRate}
            />

            {/* Class Table */}
            <ClassAttendanceTable classData={classData} onClassClick={handleClassClick} />

            {/* Quick Gender and Day Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AttendanceByGenderChart data={analyticsData.genderData} />
              <AttendanceByDayChart data={analyticsData.dayData} />
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Quick Stats */}
            <AttendanceQuickStats stats={quickStats} />

            {/* Stream Analysis */}
            <AttendanceByStreamChart 
              data={analyticsData.streamData} 
              onStreamClick={handleClassClick} 
            />

            {/* Gender and Day Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AttendanceByGenderChart data={analyticsData.genderData} />
              <AttendanceByDayChart data={analyticsData.dayData} />
            </div>

            {/* Heatmap */}
            <AttendanceHeatmap data={analyticsData.heatmapData} />
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            {/* Trend Chart */}
            <AttendanceTrendChart data={analyticsData.trendData} />

            {/* Monthly Comparison */}
            <MonthlyComparisonChart data={analyticsData.monthData} />

            {/* Stream Performance */}
            <AttendanceByStreamChart 
              data={analyticsData.streamData} 
              onStreamClick={handleClassClick} 
            />
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            {/* Top Performers */}
            <TopPerformersCard
              bestStreams={analyticsData.bestStreams}
              worstStreams={analyticsData.worstStreams}
              perfectAttendance={analyticsData.perfectAttendance}
              onStreamClick={handleClassClick}
            />

            {/* Weekly Heatmap */}
            <AttendanceHeatmap data={analyticsData.heatmapData} />

            {/* Day Analysis */}
            <AttendanceByDayChart data={analyticsData.dayData} />
          </TabsContent>
        </Tabs>

        {/* Progress Modal */}
        <ProgressModal
          isOpen={isGeneratingPdf}
          onClose={() => setIsGeneratingPdf(false)}
          progress={pdfProgress}
          title="Generating Attendance Report"
          description={pdfStatusMessage}
          isComplete={pdfProgress === 100}
        />
      </div>
    </DashboardLayout>
  );
};

export default AttendanceOverview;
