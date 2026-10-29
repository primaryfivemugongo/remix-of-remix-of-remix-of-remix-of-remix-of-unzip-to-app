import { useState, lazy, Suspense, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { 
  UserCheck, 
  Calendar, 
  Users, 
  Save,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  Upload,
  BookOpen,
  FileDown,
  FileUp,
  FileText
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { format, addDays, parseISO } from "date-fns";
import AttendanceOverview from "./admin/AttendanceOverview";
import { supabase } from "@/integrations/supabase/client";
import { EmptyAttendanceState } from "@/components/attendance/EmptyAttendanceState";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { generateAttendancePDF } from "@/utils/pdfGenerator";
import { ProgressModal } from "@/components/ui/progress-modal";

interface Student {
  id: string;
  name: string;
  email: string;
  class: string;
  stream: string;
  photoUrl?: string;
  gender?: string;
}

interface AttendanceRecord {
  studentId: string;
  status: 'present' | 'absent' | 'unmarked';
  timeMarked: string;
  absentReason?: string;
}

interface ClassInfo {
  id: string;
  name: string;
  class_id: string;
  totalStudents: number;
}

const AttendanceMarking = () => {
  const { userRole, userName, photoUrl, userId, signOut } = useAuth();
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
  const [selectedClass, setSelectedClass] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [attendanceRecords, setAttendanceRecords] = useState<{ [key: string]: AttendanceRecord }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [absentReason, setAbsentReason] = useState<string>("");
  const [customReason, setCustomReason] = useState<string>("");
  const [showReasonDialog, setShowReasonDialog] = useState(false);
  const [showMarkAllAbsentDialog, setShowMarkAllAbsentDialog] = useState(false);
  const [markAllAbsentReason, setMarkAllAbsentReason] = useState<string>("");
  const [markAllAbsentCustomReason, setMarkAllAbsentCustomReason] = useState<string>("");
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [realClasses, setRealClasses] = useState<ClassInfo[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasUnsyncedRecords, setHasUnsyncedRecords] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [attendanceProgress, setAttendanceProgress] = useState(0);
  const [showAttendanceProgress, setShowAttendanceProgress] = useState(false);
  const [attendanceComplete, setAttendanceComplete] = useState(false);
  const [attendanceStatusMessage, setAttendanceStatusMessage] = useState<string>('');
  
  // Load students from database
  useEffect(() => {
    loadStudents();
  }, []);
  
  // Load existing attendance from database when date or class changes
  useEffect(() => {
    if (selectedClass) {
      loadAttendance();
    }
  }, [selectedDate, selectedClass]);

  // Auto-sync on page load
  useEffect(() => {
    const autoSync = async () => {
      if (selectedClass) {
        const localKey = `attendance_${selectedClass}_${format(selectedDate, 'yyyy-MM-dd')}`;
        const localData = localStorage.getItem(localKey);
        
        if (localData) {
          try {
            const parsed = JSON.parse(localData);
            const records = parsed.records || {};
            const syncStatus = parsed.syncStatus || {};
            
            // Check if there are unsynced records
            const unsyncedIds = Object.keys(syncStatus).filter(id => !syncStatus[id]);
            
            if (unsyncedIds.length > 0) {
              console.log('Auto-syncing', unsyncedIds.length, 'unsynced records...');
              await syncLocalToDatabase(records, syncStatus);
            }
          } catch (error) {
            console.error('Error auto-syncing:', error);
          }
        }
      }
    };
    
    autoSync();
  }, [selectedClass, selectedDate]);

  
  const loadStudents = async () => {
    try {
      setIsLoadingStudents(true);
      
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
      
      const formattedStudents: Student[] = allStudentsData.map(s => ({
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
      const classMap = new Map<string, number>();
      formattedStudents.forEach(student => {
        classMap.set(student.stream, (classMap.get(student.stream) || 0) + 1);
      });
      
      const classList: ClassInfo[] = [];
      classMap.forEach((count, streamId) => {
        const className = streamId.split('-')[0];
        classList.push({
          id: streamId,
          name: streamId.replace('-', ' - '),
          class_id: className,
          totalStudents: count
        });
      });
      
      setRealClasses(classList.sort((a, b) => a.id.localeCompare(b.id)));
    } catch (error) {
      console.error('Error loading students:', error);
      toast.error('Failed to load students from database');
    } finally {
      setIsLoadingStudents(false);
    }
  };
  
  const loadAttendance = async () => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      // First try to load from database
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('stream_id', selectedClass)
        .eq('date', dateStr);
      
      if (error) throw error;
      
      const records: { [key: string]: AttendanceRecord } = {};
      const syncStatus: { [key: string]: boolean } = {};
      
      if (data && data.length > 0) {
        data.forEach((record: any) => {
          records[record.student_id] = {
            studentId: record.student_id,
            status: record.status,
            timeMarked: record.marked_at,
            absentReason: record.absent_reason || undefined
          };
          syncStatus[record.student_id] = true; // Database records are synced
        });
      }
      
      // Check local storage for any additional/newer records
      const localKey = `attendance_${selectedClass}_${dateStr}`;
      const localData = localStorage.getItem(localKey);
      
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          const localRecords = parsed.records || {};
          const localSyncStatus = parsed.syncStatus || {};
          
          // Merge local records (local takes precedence if exists)
          Object.keys(localRecords).forEach(studentId => {
            records[studentId] = localRecords[studentId];
            syncStatus[studentId] = localSyncStatus[studentId] || false;
          });
          
          // Check if there are unsynced records
          const hasUnsynced = Object.values(syncStatus).some(synced => !synced);
          setHasUnsyncedRecords(hasUnsynced);
        } catch (error) {
          console.error('Error parsing local storage:', error);
        }
      } else {
        setHasUnsyncedRecords(false);
      }
      
      setAttendanceRecords(records);
    } catch (error) {
      console.error('Error loading attendance:', error);
      toast.error('Failed to load attendance from database');
    }
  };

  const currentClass = realClasses.find(cls => cls.id === selectedClass);
  
  // Filter students based on selected class and search term
  const classStudents = allStudents.filter(student => student.stream === selectedClass);

  const filteredStudents = classStudents.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const syncLocalToDatabase = async (records: { [key: string]: AttendanceRecord }, syncStatus: { [key: string]: boolean }) => {
    const unsyncedIds = Object.keys(syncStatus).filter(id => !syncStatus[id]);
    
    if (unsyncedIds.length === 0) {
      setHasUnsyncedRecords(false);
      return;
    }
    
    let successCount = 0;
    const updatedSyncStatus = { ...syncStatus };
    
    for (const studentId of unsyncedIds) {
      const record = records[studentId];
      if (!record) continue;
      
      try {
        const { error } = await (supabase as any).functions.invoke('attendance-save', {
          body: {
            student_id: studentId,
            stream_id: selectedClass,
            date: format(selectedDate, 'yyyy-MM-dd'),
            status: record.status,
            marked_by: userId,
            marked_at: record.timeMarked,
            absent_reason: record.absentReason || null
          }
        });
        
        if (error) throw error;
        
        updatedSyncStatus[studentId] = true;
        successCount++;
      } catch (error) {
        console.error(`Failed to sync ${studentId}:`, error);
      }
    }
    
    // Update local storage with new sync status
    const localKey = `attendance_${selectedClass}_${format(selectedDate, 'yyyy-MM-dd')}`;
    localStorage.setItem(localKey, JSON.stringify({
      records,
      syncStatus: updatedSyncStatus
    }));
    
    // Check if all are now synced
    const stillUnsynced = Object.keys(updatedSyncStatus).filter(id => !updatedSyncStatus[id]);
    setHasUnsyncedRecords(stillUnsynced.length > 0);
    
    if (successCount > 0) {
      toast.success(`Synced ${successCount} record(s) to database`);
    }
    if (stillUnsynced.length > 0) {
      toast.warning(`${stillUnsynced.length} record(s) still need syncing`);
    }
  };

  const markAttendance = async (studentId: string, status: 'present' | 'absent', reason?: string, silent = false) => {
    // Check if trying to mark attendance on weekend
    const dayOfWeek = selectedDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      toast.error("Attendance cannot be marked on weekends (Saturday/Sunday)");
      return;
    }
    
    const student = allStudents.find(s => s.id === studentId);
    const studentName = student?.name || 'Student';
    
    const newRecord: AttendanceRecord = {
      studentId,
      status,
      timeMarked: new Date().toISOString(),
      absentReason: status === 'absent' ? reason : undefined
    };
    
    // Update local state immediately
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: newRecord
    }));
    
    // Save to local storage immediately
    const localKey = `attendance_${selectedClass}_${format(selectedDate, 'yyyy-MM-dd')}`;
    const existingData = localStorage.getItem(localKey);
    let syncStatus: { [key: string]: boolean } = {};
    
    if (existingData) {
      try {
        const parsed = JSON.parse(existingData);
        syncStatus = parsed.syncStatus || {};
      } catch (error) {
        console.error('Error parsing local storage:', error);
      }
    }
    
    // Mark as unsynced initially
    syncStatus[studentId] = false;
    
    const updatedRecords = {
      ...attendanceRecords,
      [studentId]: newRecord
    };
    
    localStorage.setItem(localKey, JSON.stringify({
      records: updatedRecords,
      syncStatus
    }));
    
    setHasUnsyncedRecords(true);
    
    // Try to save to database immediately
    try {
      const { error } = await (supabase as any).functions.invoke('attendance-save', {
        body: {
          student_id: studentId,
          stream_id: selectedClass,
          date: format(selectedDate, 'yyyy-MM-dd'),
          status,
          marked_by: userId,
          marked_at: newRecord.timeMarked,
          absent_reason: newRecord.absentReason || null
        }
      });

      if (error) throw error;

      // Mark as synced in local storage
      syncStatus[studentId] = true;
      localStorage.setItem(localKey, JSON.stringify({
        records: updatedRecords,
        syncStatus
      }));
      
      // Check if all records are now synced
      const allSynced = Object.values(syncStatus).every(synced => synced);
      setHasUnsyncedRecords(!allSynced);
      
      if (!silent) {
        toast.success(`${studentName} marked as ${status}`);
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      if (!silent) {
        toast.error(`${studentName} marked locally. Will sync when connection is restored.`);
      }
    }
  };

  const handleAbsentClick = (student: Student) => {
    setSelectedStudent(student);
    setShowReasonDialog(true);
    setAbsentReason("");
    setCustomReason("");
  };

  const handleAbsentReasonSubmit = () => {
    if (!selectedStudent) return;
    
    const finalReason = absentReason === "Other" ? customReason : absentReason;
    
    if (!finalReason) {
      toast.error("Please provide a reason for absence");
      return;
    }

    markAttendance(selectedStudent.id, 'absent', finalReason);
    setShowReasonDialog(false);
    setIsModalOpen(false);
  };

  const getAttendanceStats = () => {
    const records = Object.values(attendanceRecords);
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const total = filteredStudents.length;
    const marked = records.length;

    return { present, absent, total, marked };
  };

  const handleSyncAttendance = async () => {
    if (!hasUnsyncedRecords) return;
    
    setIsSyncing(true);
    
    try {
      const localKey = `attendance_${selectedClass}_${format(selectedDate, 'yyyy-MM-dd')}`;
      const localData = localStorage.getItem(localKey);
      
      if (!localData) {
        setHasUnsyncedRecords(false);
        setIsSyncing(false);
        return;
      }
      
      const parsed = JSON.parse(localData);
      const records = parsed.records || {};
      const syncStatus = parsed.syncStatus || {};
      
      await syncLocalToDatabase(records, syncStatus);
    } catch (error) {
      console.error('Error syncing attendance:', error);
      toast.error('Failed to sync attendance');
    } finally {
      setIsSyncing(false);
    }
  };

  const generateAnalyticsReport = async () => {
    if (!selectedClass) {
      toast.error("Please select a class first");
      return;
    }

    setIsDownloading(true);
    const toastId = toast.loading("Generating analytics report...");

    try {
      const stats = getAttendanceStats();
      const attendanceRate = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
      
      // Calculate additional analytics
      const presentStudents = filteredStudents.filter(s => attendanceRecords[s.id]?.status === 'present');
      const absentStudents = filteredStudents.filter(s => attendanceRecords[s.id]?.status === 'absent');
      const unmarkedStudents = filteredStudents.filter(s => !attendanceRecords[s.id]);

      // Gender breakdown
      const malePresent = presentStudents.filter(s => s.gender?.toLowerCase() === 'male' || s.gender?.toLowerCase() === 'm').length;
      const femalePresent = presentStudents.filter(s => s.gender?.toLowerCase() === 'female' || s.gender?.toLowerCase() === 'f').length;
      const maleAbsent = absentStudents.filter(s => s.gender?.toLowerCase() === 'male' || s.gender?.toLowerCase() === 'm').length;
      const femaleAbsent = absentStudents.filter(s => s.gender?.toLowerCase() === 'female' || s.gender?.toLowerCase() === 'f').length;

      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      let yPos = 20;

      // Header
      pdf.setFontSize(20);
      pdf.setTextColor(59, 130, 246);
      pdf.text("Attendance Analytics Report", pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 10;
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text(currentClass?.name || selectedClass, pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 5;
      pdf.setFontSize(10);
      pdf.text(format(selectedDate, 'EEEE, MMMM d, yyyy'), pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 15;

      // Summary Statistics
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Summary Statistics", 14, yPos);
      yPos += 10;

      const summaryData = [
        ['Total Students', stats.total.toString()],
        ['Students Marked', stats.marked.toString()],
        ['Present', stats.present.toString()],
        ['Absent', stats.absent.toString()],
        ['Unmarked', unmarkedStudents.length.toString()],
        ['Attendance Rate', `${attendanceRate}%`]
      ];

      (pdf as any).autoTable({
        startY: yPos,
        head: [['Metric', 'Value']],
        body: summaryData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
        margin: { left: 14, right: 14 }
      });

      yPos = (pdf as any).lastAutoTable.finalY + 15;

      // Gender Breakdown
      if (yPos > 250) {
        pdf.addPage();
        yPos = 20;
      }
      
      pdf.setFontSize(14);
      pdf.text("Gender Breakdown", 14, yPos);
      yPos += 10;

      const genderData = [
        ['Male Present', malePresent.toString()],
        ['Female Present', femalePresent.toString()],
        ['Male Absent', maleAbsent.toString()],
        ['Female Absent', femaleAbsent.toString()]
      ];

      (pdf as any).autoTable({
        startY: yPos,
        head: [['Category', 'Count']],
        body: genderData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
        margin: { left: 14, right: 14 }
      });

      yPos = (pdf as any).lastAutoTable.finalY + 15;

      // Absent Students with Reasons
      if (absentStudents.length > 0) {
        if (yPos > 250) {
          pdf.addPage();
          yPos = 20;
        }
        
        pdf.setFontSize(14);
        pdf.text("Absent Students", 14, yPos);
        yPos += 10;

        const absentData = absentStudents.map(s => [
          s.name,
          attendanceRecords[s.id]?.absentReason || 'No reason provided'
        ]);

        (pdf as any).autoTable({
          startY: yPos,
          head: [['Student Name', 'Reason']],
          body: absentData,
          theme: 'grid',
          headStyles: { fillColor: [239, 68, 68] },
          margin: { left: 14, right: 14 }
        });
      }

      // Footer
      const pageCount = (pdf as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          `Generated on ${format(new Date(), 'PPpp')} | Page ${i} of ${pageCount}`,
          pageWidth / 2,
          pdf.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      pdf.save(`attendance-analytics-${selectedClass}-${format(selectedDate, 'yyyy-MM-dd')}.pdf`);
      toast.success("Analytics report generated successfully!", { id: toastId });
    } catch (error) {
      console.error("Failed to generate report:", error);
      toast.error("Failed to generate analytics report", { id: toastId });
    } finally {
      setIsDownloading(false);
    }
  };

  const exportAsCSV = () => {
    const csvContent = [
      ['Name', 'Email', 'Class', 'Stream', 'Status', 'Time Marked', 'Absent Reason'].join(','),
      ...filteredStudents.map(s => {
        const record = attendanceRecords[s.id];
        return [
          s.name,
          s.email,
          s.class,
          s.stream,
          record?.status || 'unmarked',
          record?.timeMarked ? format(new Date(record.timeMarked), 'HH:mm:ss') : '',
          record?.absentReason || ''
        ].join(',');
      })
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${currentClass?.name}-${format(selectedDate, 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
  };

  const exportAsJSON = () => {
    const jsonData = filteredStudents.map(s => {
      const record = attendanceRecords[s.id];
      return {
        studentId: s.id,
        name: s.name,
        email: s.email,
        class: s.class,
        stream: s.stream,
        status: record?.status || 'unmarked',
        timeMarked: record?.timeMarked || null,
        absentReason: record?.absentReason || null
      };
    });
    
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${currentClass?.name}-${format(selectedDate, 'yyyy-MM-dd')}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('JSON exported successfully');
  };

  const exportAsExcel = () => {
    const wsData = [
      ['Name', 'Email', 'Class', 'Stream', 'Status', 'Time Marked', 'Absent Reason'],
      ...filteredStudents.map(s => {
        const record = attendanceRecords[s.id];
        return [
          s.name,
          s.email,
          s.class,
          s.stream,
          record?.status || 'unmarked',
          record?.timeMarked ? format(new Date(record.timeMarked), 'HH:mm:ss') : '',
          record?.absentReason || ''
        ];
      })
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
    XLSX.writeFile(wb, `attendance-${currentClass?.name}-${format(selectedDate, 'yyyy-MM-dd')}.xlsx`);
    toast.success('Excel file exported successfully');
  };

  const exportAsPDF = async () => {
    setIsDownloading(true);
    const toastId = toast.loading("Processing...");
    
    try {
      const pdfData = filteredStudents.map(student => {
        const record = attendanceRecords[student.id];
        return {
          name: student.name,
          gender: student.gender || 'N/A',
          stream: student.stream,
          status: (record?.status || 'not-marked') as 'absent' | 'not-marked' | 'present',
          timeMarked: record?.timeMarked,
          photoUrl: student.photoUrl,
          absentReason: record?.absentReason
        };
      });
      
      const pdf = await generateAttendancePDF(
        pdfData,
        selectedDate,
        (message) => toast.loading(message, { id: toastId })
      );
      
      pdf.save(`attendance-${currentClass?.name}-${format(selectedDate, 'yyyy-MM-dd')}.pdf`);
      toast.success("Download completed!", { id: toastId });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF", { id: toastId });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result;
        
        if (file.name.endsWith('.json')) {
          const jsonData = JSON.parse(content as string);
          processUploadedData(jsonData);
        } else if (file.name.endsWith('.csv')) {
          const csvData = parseCSV(content as string);
          processUploadedData(csvData);
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          const workbook = XLSX.read(content, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const excelData = XLSX.utils.sheet_to_json(sheet);
          processUploadedData(excelData);
        } else {
          toast.error('Unsupported file format. Please use JSON, CSV, or Excel.');
        }
      } catch (error) {
        console.error('Error parsing file:', error);
        toast.error('Failed to parse file. Please check the format.');
      }
    };

    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsText(file);
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const parseCSV = (csv: string) => {
    const lines = csv.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const obj: any = {};
      headers.forEach((header, i) => {
        obj[header] = values[i];
      });
      return obj;
    });
  };

  const processUploadedData = (data: any[]) => {
    const newRecords: { [key: string]: AttendanceRecord } = {};
    let updated = 0;

    data.forEach((row: any) => {
      // Support multiple field name formats
      const studentId = row.studentId || row.StudentId || row.student_id;
      const status = (row.status || row.Status)?.toLowerCase();
      
      if (!studentId || !status) return;
      
      // Find student by ID
      const student = allStudents.find(s => s.id === studentId);
      if (!student || student.stream !== selectedClass) return;

      if (status === 'present' || status === 'absent') {
        newRecords[studentId] = {
          studentId,
          status: status as 'present' | 'absent',
          timeMarked: row.timeMarked || row.TimeMarked || new Date().toISOString(),
          absentReason: row.absentReason || row.AbsentReason || row.absent_reason
        };
        updated++;
      }
    });

    if (updated > 0) {
      setAttendanceRecords(prev => ({ ...prev, ...newRecords }));
      toast.success(`Updated ${updated} attendance records from file`);
    } else {
      toast.error('No valid attendance records found in file');
    }
  };

  const markAllPresent = async () => {
    setShowAttendanceProgress(true);
    setAttendanceProgress(0);
    setAttendanceComplete(false);
    setAttendanceStatusMessage('Initializing...');

    const total = filteredStudents.length;
    
    // Mark all students as present
    for (let i = 0; i < filteredStudents.length; i++) {
      await markAttendance(filteredStudents[i].id, 'present', undefined, true);
      const progress = ((i + 1) / total) * 100;
      setAttendanceProgress(progress);
      setAttendanceStatusMessage(`Marking students present... ${i + 1}/${total}`);
    }
    
    setAttendanceStatusMessage('Complete!');
    setAttendanceComplete(true);
    toast.success(`All ${filteredStudents.length} students marked as present`);
  };

  const markAllAbsent = () => {
    setShowMarkAllAbsentDialog(true);
    setMarkAllAbsentReason("");
    setMarkAllAbsentCustomReason("");
  };

  const handleMarkAllAbsentSubmit = async () => {
    const finalReason = markAllAbsentReason === "Other" ? markAllAbsentCustomReason : markAllAbsentReason;
    
    if (!finalReason) {
      toast.error("Please select a reason for absence");
      return;
    }

    setShowMarkAllAbsentDialog(false);
    setShowAttendanceProgress(true);
    setAttendanceProgress(0);
    setAttendanceComplete(false);
    setAttendanceStatusMessage('Initializing...');

    const total = filteredStudents.length;
    
    // Mark all students as absent with the reason
    for (let i = 0; i < filteredStudents.length; i++) {
      await markAttendance(filteredStudents[i].id, 'absent', finalReason, true);
      const progress = ((i + 1) / total) * 100;
      setAttendanceProgress(progress);
      setAttendanceStatusMessage(`Marking students absent... ${i + 1}/${total}`);
    }
    
    setAttendanceStatusMessage('Complete!');
    setAttendanceComplete(true);
    toast.success(`All ${filteredStudents.length} students marked as absent: ${finalReason}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return "text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100";
      case 'absent': return "text-red-600 bg-red-50 border-red-200 hover:bg-red-100";
      default: return "text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle className="h-4 w-4" />;
      case 'absent': return <XCircle className="h-4 w-4" />;
      default: return null;
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
    
    // Prevent navigation to future dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(newDate);
    checkDate.setHours(0, 0, 0, 0);
    
    if (checkDate > today) {
      toast.error("Cannot mark attendance for future dates.");
      return;
    }
    
    setSelectedDate(newDate);
  };

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleModalAttendance = (status: 'present' | 'absent') => {
    if (selectedStudent) {
      if (status === 'absent') {
        setIsModalOpen(false);
        handleAbsentClick(selectedStudent);
      } else {
        markAttendance(selectedStudent.id, status);
        setIsModalOpen(false);
      }
    }
  };

  const stats = getAttendanceStats();

  if (!userRole) return null;

  return (
    <DashboardLayout 
      userRole={userRole} 
      userName={userName || "Teacher"}
      photoUrl={photoUrl}
      onLogout={handleLogout}
    >
      <div className="space-y-4 md:space-y-6 animate-fade-in px-2 md:px-0">
        <div className="flex flex-col gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-elegant bg-clip-text text-transparent">
              Mark Attendance
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Roll call and attendance marking for your classes
            </p>
          </div>
        </div>

        {/* Class and Date Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Class & Date Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateDate('prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium text-center flex-1 min-w-0 px-2">
                    {format(selectedDate, 'EEEE, MMM d, yyyy')}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateDate('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="w-full sm:flex-1">
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border z-50">
                      {realClasses.map(cls => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {selectedClass && (
                    <div className="relative w-full sm:flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input 
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  )}
                </div>
              </div>
          </CardContent>
        </Card>

        {/* Weekend Warning */}
        {selectedDate.getDay() === 0 || selectedDate.getDay() === 6 ? (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm font-medium">
                  Weekend Day - Attendance marking is only available Monday through Friday
                </p>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Empty State or Attendance Content */}
        {!selectedClass ? (
          <EmptyAttendanceState />
        ) : (
          <>
            {/* Attendance Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="hover-scale">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <div className="text-sm text-muted-foreground">Total Students</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover-scale">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">{stats.marked}</div>
                    <div className="text-sm text-muted-foreground">Marked</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover-scale">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">{stats.present}</div>
                    <div className="text-sm text-muted-foreground">Present</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover-scale">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
                    <div className="text-sm text-muted-foreground">Absent</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    onClick={markAllPresent}
                    variant="outline"
                    className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark All Present
                  </Button>
                  <Button 
                    onClick={markAllAbsent}
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Mark All Absent
                  </Button>
                  <Button 
                    onClick={() => {
                      setAttendanceRecords({});
                      // Clear local storage too
                      const localKey = `attendance_${selectedClass}_${format(selectedDate, 'yyyy-MM-dd')}`;
                      localStorage.removeItem(localKey);
                      setHasUnsyncedRecords(false);
                    }}
                    variant="outline"
                  >
                    Clear All
                  </Button>
                  <Button 
                    onClick={handleSyncAttendance}
                    variant={hasUnsyncedRecords ? "default" : "outline"}
                    disabled={!hasUnsyncedRecords || isSyncing}
                    className={hasUnsyncedRecords ? "" : "opacity-50 cursor-not-allowed"}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSyncing ? "Syncing..." : hasUnsyncedRecords ? "Sync Attendance" : "All Synced"}
                  </Button>
                  <Button 
                    onClick={generateAnalyticsReport}
                    variant="outline"
                    disabled={isDownloading || !selectedClass}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {isDownloading ? "Generating..." : "Generate Analytics Report"}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        <FileDown className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={exportAsCSV}>
                        <Download className="h-4 w-4 mr-2" />
                        Export as CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={exportAsJSON}>
                        <Download className="h-4 w-4 mr-2" />
                        Export as JSON
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={exportAsExcel}>
                        <Download className="h-4 w-4 mr-2" />
                        Export as Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={exportAsPDF} disabled={isDownloading}>
                        <Download className="h-4 w-4 mr-2" />
                        {isDownloading ? 'Processing...' : 'Export as PDF'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button 
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FileUp className="h-4 w-4 mr-2" />
                    Import from File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,.csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Student List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Student Roll Call - {currentClass?.name}
                </CardTitle>
                <CardDescription>
                  Mark attendance for each student by clicking the status buttons
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredStudents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No students found matching your search criteria</p>
                    </div>
                  ) : (
                    filteredStudents.map((student) => {
                      const record = attendanceRecords[student.id];
                      return (
                        <div 
                          key={student.id} 
                          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/20 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {student.photoUrl ? (
                              <img 
                                src={student.photoUrl} 
                                alt={student.name}
                                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                onError={(e) => {
                                  // Fallback to initials if image fails to load
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={`w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 ${student.photoUrl ? 'hidden' : ''}`}>
                              <span className="text-sm font-semibold">
                                {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 
                                className="font-semibold truncate cursor-pointer hover:text-primary transition-colors"
                                onClick={() => handleStudentClick(student)}
                              >
                                {student.name}
                              </h3>
                              <p className="text-sm text-muted-foreground truncate">
                                {student.email}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                            {/* Segmented Control for Attendance */}
                            <div className="flex rounded-lg border bg-muted p-1 w-full sm:w-auto">
                              <button
                                onClick={() => markAttendance(student.id, 'present')}
                                className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                  record?.status === 'present'
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                              >
                                <div className="flex items-center justify-center gap-1">
                                  <CheckCircle className="h-4 w-4" />
                                  <span>Present</span>
                                </div>
                              </button>
                              <button
                                onClick={() => handleAbsentClick(student)}
                                className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                  record?.status === 'absent'
                                    ? 'bg-red-600 text-white shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                              >
                                <div className="flex items-center justify-center gap-1">
                                  <XCircle className="h-4 w-4" />
                                  <span>Absent</span>
                                </div>
                              </button>
                            </div>
                            
                            {/* Show absence reason if student is marked absent */}
                            {record?.status === 'absent' && record.absentReason && (
                              <div className="text-xs text-muted-foreground bg-red-50 dark:bg-red-950/20 px-2 py-1 rounded border border-red-200 dark:border-red-900">
                                <span className="font-medium">Reason:</span> {record.absentReason}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Student Details Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg">Student Details</DialogTitle>
              <DialogDescription className="text-sm">
                View and mark attendance for this student
              </DialogDescription>
            </DialogHeader>
            
            {selectedStudent && (
              <div className="space-y-4">
                {/* Student Photo */}
                <div className="flex justify-center">
                  {selectedStudent.photoUrl ? (
                    <img 
                      src={selectedStudent.photoUrl} 
                      alt={selectedStudent.name}
                      className="w-20 h-20 rounded-full object-cover border-2 border-primary/20"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20 ${selectedStudent.photoUrl ? 'hidden' : ''}`}>
                    <span className="text-xl font-bold">
                      {selectedStudent.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                </div>

                {/* Student Information */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Full Name</label>
                    <p className="font-semibold">{selectedStudent.name}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Class</label>
                      <p className="text-sm font-semibold">{selectedStudent.class}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Stream</label>
                      <p className="text-sm font-semibold">{selectedStudent.stream}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Email</label>
                    <p className="text-sm break-all">{selectedStudent.email}</p>
                  </div>

                  {/* Current Status */}
                  {attendanceRecords[selectedStudent.id] && (
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Current Status</label>
                      <div>
                        <Badge className={getStatusColor(attendanceRecords[selectedStudent.id].status)}>
                          {getStatusIcon(attendanceRecords[selectedStudent.id].status)}
                          <span className="ml-1 capitalize">{attendanceRecords[selectedStudent.id].status}</span>
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>

                {/* Attendance Actions */}
                <div className="flex gap-2 pt-3 border-t">
                  <Button
                    onClick={() => handleModalAttendance('present')}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    size="sm"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Present
                  </Button>
                  <Button
                    onClick={() => handleModalAttendance('absent')}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    size="sm"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Absent
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Absent Reason Dialog */}
        <Dialog open={showReasonDialog} onOpenChange={setShowReasonDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Absence Reason</DialogTitle>
              <DialogDescription>
                Please provide a reason for {selectedStudent?.name}'s absence
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Reason</label>
                <Select value={absentReason} onValueChange={setAbsentReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a reason..." />
                  </SelectTrigger>
                  <SelectContent className="bg-background border z-50">
                    <SelectItem value="Sick">Sick</SelectItem>
                    <SelectItem value="Sent back for school fees">Sent back for school fees</SelectItem>
                    <SelectItem value="Public Holiday">Public Holiday</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {absentReason === "Other" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Specify Reason</label>
                  <Input
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Enter the reason..."
                    className="w-full"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowReasonDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAbsentReasonSubmit}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  disabled={!absentReason || (absentReason === "Other" && !customReason.trim())}
                >
                  Mark as Absent
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Mark All Absent Reason Dialog */}
        <Dialog open={showMarkAllAbsentDialog} onOpenChange={setShowMarkAllAbsentDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Mark All Students Absent</DialogTitle>
              <DialogDescription>
                Select a uniform reason for marking all students as absent
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Reason</label>
                <Select value={markAllAbsentReason} onValueChange={setMarkAllAbsentReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a reason..." />
                  </SelectTrigger>
                  <SelectContent className="bg-background border z-50">
                    <SelectItem value="Sick">Sick</SelectItem>
                    <SelectItem value="Sent back for school fees">Sent back for school fees</SelectItem>
                    <SelectItem value="Public Holiday">Public Holiday</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {markAllAbsentReason === "Other" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Specify Reason</label>
                  <Input
                    value={markAllAbsentCustomReason}
                    onChange={(e) => setMarkAllAbsentCustomReason(e.target.value)}
                    placeholder="Enter the reason..."
                    className="w-full"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowMarkAllAbsentDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleMarkAllAbsentSubmit}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  disabled={!markAllAbsentReason || (markAllAbsentReason === "Other" && !markAllAbsentCustomReason.trim())}
                >
                  Mark All Absent
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <ProgressModal
          isOpen={showAttendanceProgress}
          onClose={() => setShowAttendanceProgress(false)}
          progress={attendanceProgress}
          title="Updating Attendance"
          description="Please don't leave this page while updating is in progress"
          isComplete={attendanceComplete}
          icon={<UserCheck className="w-8 h-8 text-primary animate-pulse" />}
          statusMessage={attendanceStatusMessage}
        />
      </div>
    </DashboardLayout>
  );
};

// Main Attendance component that routes based on role
const Attendance = () => {
  const { userRole } = useAuth();

  if (!userRole) return null;

  // Admin sees overview, teachers see marking interface, students see their attendance
  if (userRole === 'admin') {
    return <AttendanceOverview />;
  }
  
  if (userRole === 'student') {
    const StudentAttendanceView = lazy(() => import('./student/StudentAttendanceView'));
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <StudentAttendanceView />
      </Suspense>
    );
  }

  return <AttendanceMarking />;
};

export default Attendance;
