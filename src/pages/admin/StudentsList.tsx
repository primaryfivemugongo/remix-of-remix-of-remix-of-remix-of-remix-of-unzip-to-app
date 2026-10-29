import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HighlightText } from "@/utils/textHighlighter";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ArrowLeft,
  Loader2
} from "lucide-react";
import { useNavigate, useSearchParams } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const defaultAvatar = "https://raw.githubusercontent.com/Fresh-Teacher/glorious-gateway-65056-78561-35497/main/src/assets/default-avatar.png";
const headerImage = "/header.png";
import { useAuth } from "@/hooks/useAuth";
import { StudentsFilters } from "@/components/admin/StudentsFilters";
import { StudentsActions } from "@/components/admin/StudentsActions";
import { StudentsPagination } from "@/components/admin/StudentsPagination";
import { StudentCard } from "@/components/admin/StudentCard";
import { ResponsiveTable, MobileCardView } from "@/components/admin/ResponsiveTable";
import { Badge } from "@/components/ui/badge";
import { AddStudentModal } from "@/components/admin/AddStudentModal";
import { StudentActionsDropdown } from "@/components/admin/StudentActionsDropdown";
import { SuspendStudentModal } from "@/components/admin/SuspendStudentModal";
import { ChangeClassModal } from "@/components/admin/ChangeClassModal";
import { ConfirmActionModal } from "@/components/admin/ConfirmActionModal";
import { UserPlus, FileText } from "lucide-react";
import { generateStudentsListPDF } from "@/utils/pdfUtils";
import { ProgressModal } from "@/components/ui/progress-modal";
import { FileDown } from "lucide-react";

interface Student {
  id: string;
  name: string;
  email: string;
  photo_url?: string;
  class_id?: string;
  stream_id?: string;
  gender?: string;
  is_verified?: boolean;
  created_at?: string;
  default_password?: string;
}

export default function StudentsList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userRole, userName, photoUrl, signOut } = useAuth();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [totalCount, setTotalCount] = useState(0);

  // Data
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState<string>("all");
  const [filterStream, setFilterStream] = useState<string>("all");
  const [filterVerified, setFilterVerified] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [paramStream, setParamStream] = useState<string | null>(null);
  
  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [changeClassModalOpen, setChangeClassModalOpen] = useState(false);
  const [expelModalOpen, setExpelModalOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [showPdfProgress, setShowPdfProgress] = useState(false);
  const [pdfComplete, setPdfComplete] = useState(false);
  const [pdfStatusMessage, setPdfStatusMessage] = useState<string>('');

  // Reference data maps
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [streams, setStreams] = useState<{ id: string; name: string; class_id?: string }[]>([]);

  const classNameById = useMemo(() => {
    const map: Record<string, string> = {};
    classes.forEach(c => { if (c.id) map[c.id] = c.name || c.id; });
    return map;
  }, [classes]);

  const streamNameById = useMemo(() => {
    const map: Record<string, string> = {};
    streams.forEach(s => { if (s.id) map[s.id] = s.name || s.id; });
    return map;
  }, [streams]);

  // Dynamic filter helpers
  const filteredStreams = useMemo(() => {
    if (filterClass === 'all') return streams;
    return streams.filter(stream => stream.class_id === filterClass);
  }, [streams, filterClass]);

  const filteredClasses = useMemo(() => {
    if (filterStream === 'all') return classes;
    const selectedStream = streams.find(s => s.id === filterStream);
    if (!selectedStream?.class_id) return classes;
    return classes.filter(c => c.id === selectedStream.class_id);
  }, [classes, streams, filterStream]);

  // Initialize from query params
  useEffect(() => {
    const classParam = searchParams.get("class");
    const streamParam = searchParams.get("stream");
    if (classParam) setFilterClass(classParam);
    if (streamParam) {
      setParamStream(streamParam);
      setFilterStream(streamParam);
    }
  }, []);

  useEffect(() => {
    const loadRefData = async () => {
      const [{ data: classData, error: classError }, { data: streamData, error: streamError }] = await Promise.all([
        supabase.from('classes').select('id, name').order('name'),
        supabase.from('streams').select('id, name, class_id').order('name')
      ]);
      if (classError) console.error('Error fetching classes:', classError);
      if (streamError) console.error('Error fetching streams:', streamError);
      setClasses(classData || []);
      setStreams(streamData || []);
    };
    loadRefData();
  }, []);

  // Debounce search term
  useEffect(() => {
    if (searchTerm !== debouncedSearchTerm) {
      setIsSearching(true);
    }
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearchTerm]);

  const fetchStudents = useCallback(async () => {
    try {
      // Only show full loading screen on initial load, not when searching/filtering
      if (initialLoad) {
        setLoading(true);
      }
      
      let query = supabase
        .from('students')
        .select('id, name, email, photo_url, class_id, stream_id, gender, is_verified, created_at', { count: 'exact' });

      // Apply filters first (more selective)
      if (filterClass && filterClass !== 'all') {
        query = query.eq('class_id', filterClass);
      }
      
      const streamId = (filterStream && filterStream !== 'all') ? filterStream : paramStream;
      if (streamId) {
        query = query.eq('stream_id', streamId);
      }
      
      if (filterVerified && filterVerified !== 'all') {
        query = query.eq('is_verified', filterVerified === 'verified');
      }

      // Apply search after filters (search on filtered set)
      if (debouncedSearchTerm) {
        query = query.or(
          `name.ilike.%${debouncedSearchTerm}%,email.ilike.%${debouncedSearchTerm}%,id.ilike.%${debouncedSearchTerm}%`
        );
      }

      // Apply sorting and pagination last
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
      
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await query.range(from, to);

      if (error) {
        console.error('Error fetching students:', error);
        toast.error('Failed to fetch students');
        return;
      }

      setStudents(data || []);
      setTotalCount(count || 0);
      setInitialLoad(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, filterClass, filterStream, filterVerified, sortBy, sortOrder, paramStream, initialLoad, pageSize]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Password', 'Class', 'Stream'];
    const csvData = students.map(student => [
      student.name || '',
      student.email || '',
      '********',
      student.class_id ? (classNameById[student.class_id] || student.class_id) : '',
      student.stream_id ? (streamNameById[student.stream_id] || student.stream_id) : ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_page_${currentPage}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handlePrint = useCallback(async () => {
    setIsPrinting(true);
    try {
      toast.success('Print functionality would be implemented here');
    } catch (error) {
      console.error('Error generating print view:', error);
      toast.error('Failed to prepare print view');
    } finally {
      setIsPrinting(false);
    }
  }, []);

  const downloadPDF = async () => {
    try {
      setShowPdfProgress(true);
      setPdfProgress(0);
      setPdfComplete(false);
      setPdfStatusMessage('Initializing...');

      // Fetch ALL students with current filters (no pagination)
      setPdfProgress(10);
      setPdfStatusMessage('Fetching student data...');
      
      let query = supabase
        .from('students')
        .select('id, name, email, photo_url, class_id, stream_id, gender, is_verified, created_at');

      // Apply same filters as the main query
      if (filterClass && filterClass !== 'all') {
        query = query.eq('class_id', filterClass);
      }
      
      const streamId = (filterStream && filterStream !== 'all') ? filterStream : paramStream;
      if (streamId) {
        query = query.eq('stream_id', streamId);
      }
      
      if (filterVerified && filterVerified !== 'all') {
        query = query.eq('is_verified', filterVerified === 'verified');
      }

      // Apply search
      if (debouncedSearchTerm) {
        query = query.or(
          `name.ilike.%${debouncedSearchTerm}%,email.ilike.%${debouncedSearchTerm}%,id.ilike.%${debouncedSearchTerm}%`
        );
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
      
      setPdfProgress(30);
      setPdfStatusMessage('Preparing student records...');
      
      const { data: allStudents, error } = await query;

      if (error) {
        console.error('Error fetching students for PDF:', error);
        toast.error('Failed to fetch students for PDF');
        setShowPdfProgress(false);
        return;
      }

      if (!allStudents || allStudents.length === 0) {
        toast.error('No students to export');
        setShowPdfProgress(false);
        return;
      }

      setPdfProgress(60);
      setPdfStatusMessage(`Processing ${allStudents.length} students...`);
      
      const doc = await generateStudentsListPDF(
        allStudents, 
        streamNameById, 
        'STUDENT DETAILS',
        (progress, message) => {
          setPdfProgress(progress);
          setPdfStatusMessage(message);
        }
      );
      
      setPdfProgress(90);
      setPdfStatusMessage('Finalizing PDF...');
      
      doc.save(`student-details-${new Date().toISOString().split('T')[0]}.pdf`);
      
      setPdfProgress(100);
      setPdfStatusMessage('Complete!');
      setPdfComplete(true);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
      setShowPdfProgress(false);
      setPdfStatusMessage('');
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("You have been logged out");
      navigate("/login");
    } catch (error: any) {
      toast.error("Failed to log out");
    }
  };

  const visiblePages = useMemo(() => {
    const pages: number[] = [];
    const maxToShow = 5;
    let start = Math.max(1, currentPage - Math.floor(maxToShow / 2));
    let end = Math.min(totalPages, start + maxToShow - 1);
    start = Math.max(1, Math.min(start, end - maxToShow + 1));
    for (let p = start; p <= end; p++) pages.push(p);
    return pages;
  }, [currentPage, totalPages]);

  if (loading && initialLoad) {
    return (
      <DashboardLayout userRole={userRole || "admin"} userName={userName} photoUrl={photoUrl} onLogout={handleLogout}>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Loading students...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={userRole || "admin"} userName={userName} photoUrl={photoUrl} onLogout={handleLogout}>
      <div className="w-full min-w-0 space-y-6 px-4 sm:px-6 lg:px-8">
        {/* Back Button & Add Student */}
        <div className="flex items-center justify-between gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Button>
          <Button onClick={() => setAddModalOpen(true)} size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Admit Student
          </Button>
        </div>

        {/* Header with PDF Button */}
        <div className="flex items-center justify-between gap-4">
          <StudentsActions 
            totalCount={totalCount}
            filteredCount={students.length}
            onExportCSV={exportToCSV}
            onPrint={handlePrint}
            isPrinting={isPrinting}
          />
          <Button onClick={downloadPDF} variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Generate PDF
          </Button>
        </div>

        {/* Filters */}
        <StudentsFilters 
          searchTerm={searchTerm}
          setSearchTerm={(value) => {
            setSearchTerm(value);
            setCurrentPage(1);
          }}
          filterClass={filterClass}
          setFilterClass={(value) => {
            setFilterClass(value);
            if (value !== 'all' && filterStream !== 'all') {
              const selectedStream = streams.find(s => s.id === filterStream);
              if (selectedStream?.class_id !== value) {
                setFilterStream('all');
              }
            }
            setCurrentPage(1);
          }}
          filterStream={filterStream}
          setFilterStream={(value) => {
            setFilterStream(value);
            if (value !== 'all') {
              const selectedStream = streams.find(s => s.id === value);
              if (selectedStream?.class_id && filterClass !== selectedStream.class_id) {
                setFilterClass(selectedStream.class_id);
              }
            }
            setCurrentPage(1);
          }}
          filterVerified={filterVerified}
          setFilterVerified={(value) => {
            setFilterVerified(value);
            setCurrentPage(1);
          }}
          classes={classes}
          streams={streams}
          filteredStreams={filteredStreams}
          isSearching={isSearching}
        />

        {/* Students Table - Desktop */}
        <ResponsiveTable title={`Students (${students.length})`}>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Student</TableHead>
              <TableHead className="min-w-[200px]">Email</TableHead>
              <TableHead className="min-w-[100px]">Class</TableHead>
              <TableHead className="min-w-[100px]">Stream</TableHead>
              <TableHead className="min-w-[100px]">Status</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  {isSearching ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Searching...</span>
                    </div>
                  ) : (
                    "No students found matching your criteria."
                  )}
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="min-w-[200px]">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage 
                          src={student.photo_url}
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = defaultAvatar; }}
                          alt={`${student.name || 'Student'} avatar`} 
                        />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {student.name?.split(' ').map(n => n[0]).join('') || 'ST'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">
                          <HighlightText text={student.name || 'No Name'} searchTerm={debouncedSearchTerm} />
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="min-w-[200px]">
                    <a
                      href={`mailto:${student.email}`}
                      className="text-sm truncate hover:text-primary hover:underline cursor-pointer block"
                    >
                      <HighlightText text={student.email || ''} searchTerm={debouncedSearchTerm} />
                    </a>
                  </TableCell>
                  <TableCell className="min-w-[100px]">
                    <span className="truncate block">
                      {student.class_id ? (classNameById[student.class_id] || student.class_id) : '-'}
                    </span>
                  </TableCell>
                  <TableCell className="min-w-[100px]">
                    <span className="truncate block">
                      {student.stream_id ? (streamNameById[student.stream_id] || student.stream_id) : '-'}
                    </span>
                  </TableCell>
                  <TableCell className="min-w-[100px]">
                    <Badge variant={student.is_verified ? "default" : "secondary"} className="shrink-0">
                      {student.is_verified ? "Verified" : "Unverified"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <StudentActionsDropdown
                      studentId={student.id}
                      studentName={student.name}
                      onSuspend={() => {
                        setSelectedStudent(student);
                        setSuspendModalOpen(true);
                      }}
                      onExpel={() => {
                        setSelectedStudent(student);
                        setExpelModalOpen(true);
                      }}
                      onArchive={() => {
                        setSelectedStudent(student);
                        setArchiveModalOpen(true);
                      }}
                      onChangeClass={() => {
                        setSelectedStudent(student);
                        setChangeClassModalOpen(true);
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </ResponsiveTable>

        {/* Students Cards - Mobile */}
        <MobileCardView title="Students" count={students.length}>
          {students.length === 0 ? (
            <Card className="w-full">
              <CardContent className="text-center py-8">
                {isSearching ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Searching...</span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No students found matching your criteria.</p>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3 w-full">
              {students.map((student) => (
                <StudentCard 
                  key={student.id}
                  student={student}
                  classNameById={classNameById}
                  streamNameById={streamNameById}
                  searchTerm={debouncedSearchTerm}
                />
              ))}
            </div>
          )}
        </MobileCardView>

        {/* Pagination */}
        <StudentsPagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          visiblePages={visiblePages}
        />

        {/* Modals */}
        <AddStudentModal
          open={addModalOpen}
          onOpenChange={setAddModalOpen}
          onSuccess={fetchStudents}
          classes={classes}
          streams={streams}
        />

        {selectedStudent && (
          <>
            <SuspendStudentModal
              open={suspendModalOpen}
              onOpenChange={setSuspendModalOpen}
              studentId={selectedStudent.id}
              studentName={selectedStudent.name}
              onSuccess={fetchStudents}
            />
            <ChangeClassModal
              open={changeClassModalOpen}
              onOpenChange={setChangeClassModalOpen}
              studentId={selectedStudent.id}
              studentName={selectedStudent.name}
              currentClassId={selectedStudent.class_id}
              currentStreamId={selectedStudent.stream_id}
              onSuccess={fetchStudents}
              classes={classes}
              streams={streams}
            />
            <ConfirmActionModal
              open={expelModalOpen}
              onOpenChange={setExpelModalOpen}
              title="Expel Student"
              description={`Are you sure you want to permanently expel ${selectedStudent.name}? This action cannot be undone.`}
              confirmText="Expel Student"
              variant="destructive"
              onConfirm={async () => {
                try {
                  const { error } = await supabase
                    .from("students")
                    .delete()
                    .eq("id", selectedStudent.id);
                  if (error) throw error;
                  toast.success(`${selectedStudent.name} has been expelled`);
                  fetchStudents();
                  setExpelModalOpen(false);
                } catch (error: any) {
                  toast.error(error.message || "Failed to expel student");
                }
              }}
            />
            <ConfirmActionModal
              open={archiveModalOpen}
              onOpenChange={setArchiveModalOpen}
              title="Archive Student"
              description={`Archive ${selectedStudent.name}? They will be removed from active lists but their record will be preserved.`}
              confirmText="Archive"
              variant="default"
              onConfirm={async () => {
                try {
                  const { error } = await supabase
                    .from("students")
                    .update({ is_verified: false })
                    .eq("id", selectedStudent.id);
                  if (error) throw error;
                  toast.success(`${selectedStudent.name} has been archived`);
                  fetchStudents();
                  setArchiveModalOpen(false);
                } catch (error: any) {
                  toast.error(error.message || "Failed to archive student");
                }
              }}
            />
          </>
        )}
      </div>

      <ProgressModal
        isOpen={showPdfProgress}
        onClose={() => setShowPdfProgress(false)}
        progress={pdfProgress}
        title="Generating PDF"
        description="Please don't leave this page while generating is in progress"
        isComplete={pdfComplete}
        icon={<FileDown className="w-8 h-8 text-primary animate-pulse" />}
        statusMessage={pdfStatusMessage}
      />
    </DashboardLayout>
  );
}