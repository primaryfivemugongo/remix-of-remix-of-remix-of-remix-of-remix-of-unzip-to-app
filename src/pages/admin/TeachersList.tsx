import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Search, 
  Filter, 
  ArrowLeft,
  Loader2,
  UserPlus,
  FileText,
  Phone,
  MapPin,
  Mail
} from "lucide-react";
import { useNavigate } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateTeachersListPDF } from "@/utils/pdfUtils";
import { ProgressModal } from "@/components/ui/progress-modal";
import { FileDown } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { StudentsPagination } from "@/components/admin/StudentsPagination";
import { AddTeacherModal } from "@/components/admin/AddTeacherModal";
import { TeacherActionsDropdown } from "@/components/admin/TeacherActionsDropdown";
import { SuspendTeacherModal } from "@/components/admin/SuspendTeacherModal";
import { TeacherLeaveModal } from "@/components/admin/TeacherLeaveModal";
import { ChangeTeacherClassModal } from "@/components/admin/ChangeTeacherClassModal";
import { ConfirmActionModal } from "@/components/admin/ConfirmActionModal";

interface Teacher {
  id: string;
  teacher_id?: string;
  name: string;
  email: string;
  personal_email?: string;
  photo_url?: string;
  nationality?: string;
  sex?: string;
  contactNumber?: number;
  classesTaught?: string;
  subjectsTaught?: string;
  is_verified: boolean;
  created_at: string;
}

export default function TeachersList() {
  const navigate = useNavigate();
  const { userName, photoUrl } = useAuth();
  
  const handleLogout = () => {
    navigate('/login');
  };
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [changeClassModalOpen, setChangeClassModalOpen] = useState(false);
  const [terminateModalOpen, setTerminateModalOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [showPdfProgress, setShowPdfProgress] = useState(false);
  const [pdfComplete, setPdfComplete] = useState(false);
  const [pdfStatusMessage, setPdfStatusMessage] = useState<string>('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    filterTeachers();
  }, [teachers, debouncedSearchTerm, filterType]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching teachers:', error);
        toast.error('Failed to fetch teachers');
        return;
      }

      setTeachers(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to fetch teachers');
    } finally {
      setLoading(false);
    }
  };

  const filterTeachers = () => {
    let filtered = teachers;

    // Search filter
    if (debouncedSearchTerm) {
      filtered = filtered.filter(teacher =>
        teacher.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        teacher.email?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        teacher.teacher_id?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        teacher.subjectsTaught?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    // Advanced filters
    if (filterType !== "all") {
      const [filterCategory, filterValue] = filterType.split("-");
      
      if (filterCategory === "status") {
        if (filterValue === "verified") filtered = filtered.filter(teacher => teacher.is_verified);
        if (filterValue === "unverified") filtered = filtered.filter(teacher => !teacher.is_verified);
      } else if (filterCategory === "gender") {
        filtered = filtered.filter(teacher => teacher.sex === filterValue);
      }
    }

    setFilteredTeachers(filtered);
  };

  const downloadPDF = async () => {
    try {
      setShowPdfProgress(true);
      setPdfProgress(0);
      setPdfComplete(false);
      setPdfStatusMessage('Initializing...');
      
      setPdfProgress(30);
      setPdfStatusMessage(`Preparing ${filteredTeachers.length} teacher records...`);
      
      const doc = await generateTeachersListPDF(filteredTeachers);
      
      setPdfProgress(70);
      setPdfStatusMessage('Finalizing PDF...');
      
      doc.save(`staff-details-${new Date().toISOString().split('T')[0]}.pdf`);
      
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

  // Pagination
  const paginatedTeachers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredTeachers.slice(startIndex, endIndex);
  }, [filteredTeachers, currentPage]);

  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);

  const visiblePages = useMemo(() => {
    const maxVisible = 5;
    const pages: number[] = [];
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      let end = Math.min(totalPages, start + maxVisible - 1);
      
      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }, [currentPage, totalPages]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filterType]);

  const filterOptions = useMemo(() => {
    const statusOptions = [
      { value: "status-verified", label: "Verified" },
      { value: "status-unverified", label: "Unverified" }
    ];
    
    const genderOptions = [
      { value: "gender-Male", label: "Male" },
      { value: "gender-Female", label: "Female" }
    ];

    return [
      { label: "Status", options: statusOptions },
      { label: "Gender", options: genderOptions }
    ];
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading teachers...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout 
      userRole="admin" 
      userName={userName} 
      photoUrl={photoUrl} 
      onLogout={handleLogout}
    >
      <div className="w-full min-w-0 max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-8 px-2 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Button variant="outline" size="sm" onClick={() => navigate('/')} className="shrink-0">
              <ArrowLeft className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold truncate">Teachers ({filteredTeachers.length})</h1>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">Total: {teachers.length} teachers</p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto shrink-0">
            <Button onClick={downloadPDF} variant="outline" size="sm" className="flex-1 sm:flex-none">
              <FileText className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">PDF</span>
            </Button>
            <Button onClick={() => setAddModalOpen(true)} size="sm" className="flex-1 sm:flex-none">
              <UserPlus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Enroll Teacher</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="shadow-md">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
              Search & Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="relative min-w-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 sm:h-11"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-48 h-10 sm:h-11">
                  <SelectValue placeholder="All Filters" />
                </SelectTrigger>
                <SelectContent className="max-h-48 overflow-y-auto">
                  <SelectItem value="all">All Teachers</SelectItem>
                  {filterOptions.map((group) => (
                    group.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

      {/* Teachers Table */}
      <div className="space-y-4">
        {/* Desktop Table View */}
        <Card className="hidden lg:block">
          <CardHeader>
            <CardTitle>Teachers ({filteredTeachers.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Teacher</TableHead>
                    <TableHead className="min-w-[200px]">Contact</TableHead>
                    <TableHead className="min-w-[150px]">Subjects/Classes</TableHead>
                    <TableHead className="min-w-[120px]">Status</TableHead>
                    <TableHead className="min-w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeachers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No teachers found matching your criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedTeachers.map((teacher) => (
                      <TableRow key={teacher.id}>
                        <TableCell className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 flex-shrink-0">
                              <AvatarImage src={teacher.photo_url} />
                              <AvatarFallback>
                                {teacher.name?.split(' ').map(n => n[0]).join('') || 'T'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium truncate">{teacher.name || 'No Name'}</p>
                              <p className="text-sm text-muted-foreground truncate">{teacher.teacher_id || 'No ID'}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="p-4">
                          <div className="space-y-1">
                            <a 
                              href={`mailto:${teacher.email}`}
                              className="text-sm truncate max-w-[180px] hover:text-primary hover:underline cursor-pointer block"
                            >
                              {teacher.email}
                            </a>
                            {teacher.contactNumber && (
                              <a
                                href={`tel:+256${teacher.contactNumber}`}
                                className="text-xs text-muted-foreground flex items-center gap-1 hover:text-primary hover:underline cursor-pointer"
                              >
                                <Phone className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">+256{teacher.contactNumber}</span>
                              </a>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="p-4">
                          <div className="space-y-1">
                            {teacher.subjectsTaught && (
                              <p className="text-sm font-medium truncate max-w-[130px]">{teacher.subjectsTaught}</p>
                            )}
                            {teacher.classesTaught && (
                              <p className="text-xs text-muted-foreground truncate max-w-[130px]">Classes: {teacher.classesTaught}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="p-4">
                          <div className="flex flex-col gap-1">
                            <Badge variant={teacher.is_verified ? "default" : "secondary"} className="text-xs w-fit">
                              {teacher.is_verified ? "Verified" : "Unverified"}
                            </Badge>
                            {teacher.sex && (
                              <Badge variant="outline" className="text-xs w-fit">{teacher.sex}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="p-4">
                          <TeacherActionsDropdown
                            teacherId={teacher.id}
                            teacherName={teacher.name}
                            onSuspend={() => {
                              setSelectedTeacher(teacher);
                              setSuspendModalOpen(true);
                            }}
                            onTerminate={() => {
                              setSelectedTeacher(teacher);
                              setTerminateModalOpen(true);
                            }}
                            onArchive={() => {
                              setSelectedTeacher(teacher);
                              setArchiveModalOpen(true);
                            }}
                            onChangeClass={() => {
                              setSelectedTeacher(teacher);
                              setChangeClassModalOpen(true);
                            }}
                            onLeave={() => {
                              setSelectedTeacher(teacher);
                              setLeaveModalOpen(true);
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {totalPages > 1 && (
              <StudentsPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                visiblePages={visiblePages}
              />
            )}
          </CardContent>
        </Card>

        {/* Mobile Card Grid */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold">Teachers ({filteredTeachers.length})</h3>
          </div>
          
          {filteredTeachers.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 sm:py-12 text-sm">
                No teachers found matching your criteria.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {paginatedTeachers.map((teacher) => (
                <Card key={teacher.id} className="w-full overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-3 sm:p-4">
                    {/* Header with Avatar and Name */}
                    <div className="flex items-start gap-2 sm:gap-3 mb-3">
                      <Avatar className="h-9 w-9 sm:h-10 sm:w-10 shrink-0">
                        <AvatarImage src={teacher.photo_url} />
                        <AvatarFallback className="text-xs">
                          {teacher.name?.split(' ').map(n => n[0]).join('') || 'T'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-xs sm:text-sm leading-tight mb-1 break-words">
                          {teacher.name || 'No Name'}
                        </h4>
                        <a
                          href={`mailto:${teacher.email}`}
                          className="text-xs text-muted-foreground truncate hover:text-primary hover:underline cursor-pointer block"
                        >
                          {teacher.email}
                        </a>
                        {teacher.teacher_id && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            ID: {teacher.teacher_id}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex justify-center mb-2 sm:mb-3">
                      <Badge 
                        variant={teacher.is_verified ? "default" : "secondary"} 
                        className="text-xs px-2 py-1"
                      >
                        {teacher.is_verified ? "✓ Verified" : "⚠ Unverified"}
                      </Badge>
                    </div>
                    
                    {/* Subjects and Classes - Compact */}
                    {(teacher.subjectsTaught || teacher.classesTaught) && (
                      <div className="space-y-1.5 mb-2 sm:mb-3 p-2 bg-muted/30 rounded text-xs">
                        {teacher.subjectsTaught && (
                          <div>
                            <span className="font-medium text-muted-foreground block mb-0.5">
                              Subjects:
                            </span>
                            <p className="font-medium break-words line-clamp-2">
                              {teacher.subjectsTaught}
                            </p>
                          </div>
                        )}
                        {teacher.classesTaught && (
                          <div>
                            <span className="font-medium text-muted-foreground block mb-0.5">
                              Classes:
                            </span>
                            <p className="break-words line-clamp-1">
                              {teacher.classesTaught}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Additional Info - Compact */}
                    <div className="space-y-1.5 mb-2 sm:mb-3 text-xs">
                      {teacher.contactNumber && (
                        <a
                          href={`tel:+256${teacher.contactNumber}`}
                          className="flex items-center gap-1.5 hover:text-primary hover:underline cursor-pointer"
                        >
                          <Phone className="h-3 w-3 shrink-0 text-muted-foreground" />
                          <span className="truncate">+256{teacher.contactNumber}</span>
                        </a>
                      )}
                      
                      <div className="flex flex-wrap gap-1">
                        {teacher.sex && (
                          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                            {teacher.sex}
                          </Badge>
                        )}
                        {teacher.nationality && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0.5 flex items-center gap-1 max-w-full">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">{teacher.nationality}</span>
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-muted-foreground truncate">
                        Joined: {new Date(teacher.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                      <Button size="sm" variant="outline" className="h-7 sm:h-8 text-xs">
                        <Mail className="h-3 w-3 sm:mr-1" />
                        <span className="hidden sm:inline">Email</span>
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 sm:h-8 text-xs">
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {totalPages > 1 && (
            <StudentsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              visiblePages={visiblePages}
            />
          )}
        </div>
      </div>
      
      {/* Modals */}
      <AddTeacherModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSuccess={fetchTeachers}
      />
      
      {selectedTeacher && (
        <>
          <SuspendTeacherModal
            open={suspendModalOpen}
            onOpenChange={setSuspendModalOpen}
            teacherId={selectedTeacher.id}
            teacherName={selectedTeacher.name}
            onSuccess={fetchTeachers}
          />
          
          <TeacherLeaveModal
            open={leaveModalOpen}
            onOpenChange={setLeaveModalOpen}
            teacherId={selectedTeacher.id}
            teacherName={selectedTeacher.name}
            onSuccess={fetchTeachers}
          />
          
          <ChangeTeacherClassModal
            open={changeClassModalOpen}
            onOpenChange={setChangeClassModalOpen}
            teacherId={selectedTeacher.id}
            teacherName={selectedTeacher.name}
            currentClasses={selectedTeacher.classesTaught}
            currentSubjects={selectedTeacher.subjectsTaught}
            onSuccess={fetchTeachers}
          />
          
          <ConfirmActionModal
            open={terminateModalOpen}
            onOpenChange={setTerminateModalOpen}
            onConfirm={async () => {
              const { error } = await supabase.from("teachers").delete().eq("id", selectedTeacher.id);
              if (error) toast.error("Failed to terminate teacher");
              else { toast.success("Teacher terminated"); fetchTeachers(); }
              setTerminateModalOpen(false);
            }}
            title="Terminate Teacher"
            description={`Are you sure you want to permanently terminate ${selectedTeacher.name}? This action cannot be undone.`}
            confirmText="Terminate"
            variant="destructive"
          />
          
          <ConfirmActionModal
            open={archiveModalOpen}
            onOpenChange={setArchiveModalOpen}
            onConfirm={async () => {
              const { error } = await supabase.from("teachers").update({ is_verified: false }).eq("id", selectedTeacher.id);
              if (error) toast.error("Failed to archive teacher");
              else { toast.success("Teacher archived"); fetchTeachers(); }
              setArchiveModalOpen(false);
            }}
            title="Archive Teacher"
            description={`Archive ${selectedTeacher.name}? They will be marked as inactive.`}
            confirmText="Archive"
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