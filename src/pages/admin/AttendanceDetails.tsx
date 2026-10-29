import { useState, useRef, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Download, Search } from "lucide-react";
import { useNavigate, useSearchParams } from "@/lib/router-compat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { toast } from "sonner";
import { format } from "date-fns";
import { generateAttendancePDF } from "@/utils/pdfGenerator";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

const ITEMS_PER_PAGE = 20;

const AttendanceDetails = () => {
  const { userRole, userName, photoUrl, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const classId = searchParams.get('class');
  const filterParam = searchParams.get('filter');
  
  const [searchTerm, setSearchTerm] = useState("");
  const [streamFilter, setStreamFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [attendanceData, setAttendanceData] = useState<any>({});
  const [isDownloading, setIsDownloading] = useState(false);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [streamList, setStreamList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load students from database
  useEffect(() => {
    loadStudents();
  }, []);

  // Load attendance from database
  useEffect(() => {
    if (allStudents.length > 0) {
      loadAttendance();
    }
  }, [allStudents]);

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      
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
      
      // Build unique stream list
      const streams = new Set<string>();
      formattedStudents.forEach(student => streams.add(student.stream));
      setStreamList(Array.from(streams).sort());
      
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
        .eq('date', format(new Date(), 'yyyy-MM-dd'));
      
      if (error) throw error;
      
      const attendance: any = {};
      data?.forEach((record: any) => {
        attendance[record.student_id] = {
          status: record.status,
          timeMarked: record.marked_at || record.created_at,
          absentReason: record.absent_reason
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

  // Get base students based on class filter
  const baseStudents = classId ? allStudents.filter(s => s.stream === classId) : allStudents;
  
  const className = classId ? classId.replace('-', ' - ') : (
    filterParam === 'all' ? 'All Students' :
    filterParam === 'present' ? 'Present Students' :
    filterParam === 'absent' ? 'Absent Students' :
    filterParam === 'pending' ? 'Pending Attendance' : 'All Students'
  );

  // Apply all filters and search
  const filteredStudents = useMemo(() => {
    let students = baseStudents.map(student => ({
      ...student,
      status: attendanceData[student.id]?.status || 'not-marked',
      timeMarked: attendanceData[student.id]?.timeMarked
    }));

    // Apply URL param filter (from stats cards)
    if (filterParam === 'present') {
      students = students.filter(s => s.status === 'present');
    } else if (filterParam === 'absent') {
      students = students.filter(s => s.status === 'absent');
    } else if (filterParam === 'pending') {
      students = students.filter(s => s.status === 'not-marked');
    }

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      students = students.filter(s => 
        s.name.toLowerCase().includes(search) ||
        s.email.toLowerCase().includes(search) ||
        s.id.toLowerCase().includes(search)
      );
    }

    // Apply stream filter
    if (streamFilter !== "all") {
      students = students.filter(s => s.stream === streamFilter);
    }

    // Apply status filter
    if (statusFilter === "present") {
      students = students.filter(s => s.status === 'present');
    } else if (statusFilter === "absent") {
      students = students.filter(s => s.status === 'absent');
    } else if (statusFilter === "pending") {
      students = students.filter(s => s.status === 'not-marked');
    }

    return students;
  }, [baseStudents, attendanceData, filterParam, searchTerm, streamFilter, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when filters change and scroll to top
  useMemo(() => {
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchTerm, streamFilter, statusFilter]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const stats = {
    total: baseStudents.length,
    present: baseStudents.filter(s => attendanceData[s.id]?.status === 'present').length,
    absent: baseStudents.filter(s => attendanceData[s.id]?.status === 'absent').length,
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    const toastId = toast.loading("Processing...");
    
    try {
      const pdfData = filteredStudents.map(student => ({
        name: student.name,
        gender: student.gender || 'N/A',
        stream: student.stream,
        status: attendanceData[student.id]?.status || 'not-marked',
        timeMarked: attendanceData[student.id]?.timeMarked,
        photoUrl: student.photoUrl
      }));
      
      const pdf = await generateAttendancePDF(
        pdfData,
        new Date(),
        (message) => toast.loading(message, { id: toastId })
      );
      
      pdf.save(`attendance-${className.replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      toast.success("Download completed!", { id: toastId });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF", { id: toastId });
    } finally {
      setIsDownloading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'present') return <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200">Present</Badge>;
    if (status === 'absent') return <Badge className="bg-red-500/10 text-red-700 border-red-200">Absent</Badge>;
    return <Badge variant="outline">Not Marked</Badge>;
  };

  if (!userRole) return null;
  
  if (isLoading) {
    return (
      <DashboardLayout userRole={userRole} userName={userName || "Admin"} photoUrl={photoUrl} onLogout={handleLogout}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading attendance data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={userRole} userName={userName || "Admin"} photoUrl={photoUrl} onLogout={handleLogout}>
      <div className="w-full max-w-full overflow-x-hidden space-y-4 sm:space-y-6 animate-fade-in px-3 sm:px-4 lg:px-6">
        {/* Header */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <Button variant="outline" size="icon" onClick={() => navigate('/admin/attendance')} className="shrink-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl sm:text-2xl lg:text-3xl mb-2">
                  Class Attendance Details
                </CardTitle>
                <div className="space-y-1">
                  <p className="text-sm sm:text-base font-semibold text-foreground">
                    {className}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Date: {format(new Date(), 'EEEE, MMMM d, yyyy')}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Showing {filteredStudents.length} of {stats.total} students
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <Button onClick={handleDownloadPDF} size="sm" className="w-full sm:w-auto" disabled={isDownloading}>
              <Download className="h-4 w-4 mr-2" />
              <span className="truncate">{isDownloading ? 'Processing...' : 'Download Attendance Report'}</span>
            </Button>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
          <Card className="min-w-0">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="text-center">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">{stats.total}</div>
                <div className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground mt-1">Total</div>
              </div>
            </CardContent>
          </Card>
          <Card className="min-w-0">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="text-center">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-emerald-600 truncate">{stats.present}</div>
                <div className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground mt-1">Present</div>
              </div>
            </CardContent>
          </Card>
          <Card className="min-w-0">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="text-center">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600 truncate">{stats.absent}</div>
                <div className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground mt-1">Absent</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="min-w-0">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col gap-2 sm:gap-3">
              <div className="relative w-full min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full">
                {!classId && (
                  <Select value={streamFilter} onValueChange={setStreamFilter}>
                    <SelectTrigger className="w-full bg-background border">
                      <SelectValue placeholder="All Streams" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border z-50">
                      <SelectItem value="all">All Streams</SelectItem>
                      {streamList.map(stream => (
                        <SelectItem key={stream} value={stream}>
                          {stream.replace('-', ' - ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className={`w-full bg-background border ${!classId ? '' : 'sm:col-span-2'}`}>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border z-50">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="present">Present Only</SelectItem>
                    <SelectItem value="absent">Absent Only</SelectItem>
                    <SelectItem value="pending">Pending Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student List - Desktop */}
        <Card className="hidden lg:block min-w-0">
          <CardHeader className="p-4 lg:p-6">
            <CardTitle className="text-lg">Attendance List</CardTitle>
            <CardDescription className="text-sm">{format(new Date(), 'EEEE, MMMM d, yyyy')}</CardDescription>
          </CardHeader>
          <CardContent className="p-4 lg:p-6">
            {paginatedStudents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                No students found matching your filters
              </div>
            ) : (
              <div className="space-y-3">
                {paginatedStudents.map((student) => (
                  <div 
                    key={student.id} 
                    className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors min-w-0 cursor-pointer"
                    onClick={() => navigate(`/admin/attendance/student/${student.id}`)}
                  >
                    <Avatar className="h-12 w-12 shrink-0">
                      <AvatarImage src={student.photoUrl} />
                      <AvatarFallback>
                        {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-semibold truncate hover:text-primary">{student.name}</h4>
                      <p className="text-sm text-muted-foreground truncate">{student.email}</p>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{student.stream.replace('-', ' - ')}</p>
                      {attendanceData[student.id]?.absentReason && student.status === 'absent' && (
                        <p className="text-xs text-red-600 mt-1 truncate">Reason: {attendanceData[student.id].absentReason}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {getStatusBadge(student.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Student Grid - Mobile/Tablet */}
        <div className="lg:hidden w-full min-w-0">
          <Card className="min-w-0">
            <CardHeader className="p-3 sm:p-4">
              <CardTitle className="text-sm sm:text-base">Attendance List</CardTitle>
              <CardDescription className="text-[10px] sm:text-xs">{format(new Date(), 'EEEE, MMM d, yyyy')}</CardDescription>
            </CardHeader>
            <CardContent className="p-3">
              {paginatedStudents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No students found
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 w-full">
                  {paginatedStudents.map((student) => (
                    <div 
                      key={student.id} 
                      className="p-3 rounded-lg border hover:bg-muted/50 transition-colors min-w-0 cursor-pointer"
                      onClick={() => navigate(`/admin/attendance/student/${student.id}`)}
                    >
                      <div className="flex items-start gap-2 mb-2 min-w-0">
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarImage src={student.photoUrl} />
                          <AvatarFallback className="text-xs">
                            {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold truncate hover:text-primary">{student.name}</h4>
                          <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                          <p className="text-xs text-muted-foreground mt-1 truncate">{student.stream.replace('-', ' - ')}</p>
                          {attendanceData[student.id]?.absentReason && student.status === 'absent' && (
                            <p className="text-xs text-red-600 mt-1 truncate">Reason: {attendanceData[student.id].absentReason}</p>
                          )}
                        </div>
                        <div className="shrink-0">
                          {getStatusBadge(student.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="w-full overflow-x-auto">
            <Pagination>
              <PaginationContent className="flex-wrap justify-center gap-1">
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  // On mobile, show fewer pages
                  const isMobile = window.innerWidth < 640;
                  const showPage = isMobile 
                    ? (page === 1 || page === totalPages || page === currentPage)
                    : (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1));
                  
                  if (showPage) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (
                    (!isMobile && (page === currentPage - 2 || page === currentPage + 2)) ||
                    (isMobile && ((page === currentPage - 1 && currentPage > 2) || (page === currentPage + 1 && currentPage < totalPages - 1)))
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  return null;
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default AttendanceDetails;
