import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfessionalCard } from "@/components/ui/professional-card";
import { ProfessionalButton } from "@/components/ui/professional-button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  FileText,
  ArrowLeft,
  Loader2,
  Download,
  GraduationCap,
  Award,
  TrendingUp,
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  Vote
} from "lucide-react";
import { useNavigate } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ApplicationPreview from "@/components/electoral/ApplicationPreview";
import AddPrefectModal from "@/components/electoral/AddPrefectModal";
import EditPrefectModal from "@/components/electoral/EditPrefectModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { DownloadProgressModal } from "@/components/ui/download-progress-modal";

const headerImage = "/header.png";
import { formatInTimeZone } from 'date-fns-tz';
import { getManualApplications, updateManualApplication, deleteManualApplication } from "@/utils/electoralStorageUtils";

interface ElectoralApplication {
  id: string;
  student_name: string;
  student_email: string;
  student_photo: string | null;
  position: string;
  class_name: string;
  stream_name: string;
  sex?: string;
  age?: number;
  class_teacher_name?: string;
  class_teacher_tel?: string;
  parent_name?: string;
  parent_tel?: string;
  status: 'pending' | 'confirmed' | 'rejected';
  created_at: string;
}

export default function ElectoralApplications() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userName, photoUrl } = useAuth();
  const [applications, setApplications] = useState<ElectoralApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState<ElectoralApplication | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [showFormalPreview, setShowFormalPreview] = useState(false);
  const [bulkDownloading, setBulkDownloading] = useState(false);
  const [downloadingCandidates, setDownloadingCandidates] = useState(false);
  const [downloadingApplications, setDownloadingApplications] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0, isComplete: false });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingApplication, setEditingApplication] = useState<ElectoralApplication | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingApplication, setDeletingApplication] = useState<ElectoralApplication | null>(null);
  
  const handleLogout = () => {
    navigate('/login');
  };

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchApplications();
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel('electoral-applications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'electoral_applications'
        },
        () => {
          fetchApplications();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      
      // Fetch from database
      const { data, error } = await supabase
        .from('electoral_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch from localStorage (manually added applications)
      const manualApps = getManualApplications();
      
      // Combine both sources
      const allApplications = [
        ...(data || []).map(app => ({
          ...app,
          status: (app.status || 'pending') as 'pending' | 'confirmed' | 'rejected'
        })),
        ...manualApps
      ];
      
      // Sort by created_at descending
      allApplications.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      setApplications(allApplications);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: "Failed to load applications. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: 'confirmed' | 'rejected') => {
    try {
      setUpdating(applicationId);
      
      // Check if it's a manual application
      if (applicationId.startsWith('manual_')) {
        // Update in localStorage
        const updated = updateManualApplication(applicationId, { status: newStatus });
        if (!updated) {
          throw new Error('Failed to update manual application');
        }
      } else {
        // Update in database
        const { error } = await supabase
          .from('electoral_applications')
          .update({ status: newStatus })
          .eq('id', applicationId);

        if (error) throw error;
      }

      // Update local state
      setApplications(apps => 
        apps.map(app => 
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );

      toast({
        title: "Status Updated",
        description: `Application has been ${newStatus}.`,
      });
    } catch (error) {
      console.error('Error updating application:', error);
      toast({
        title: "Error",
        description: "Failed to update application status.",
        variant: "destructive"
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteApplication = async () => {
    if (!deletingApplication) return;

    try {
      // Check if it's a manual application
      if (deletingApplication.id.startsWith('manual_')) {
        // Delete from localStorage
        const deleted = deleteManualApplication(deletingApplication.id);
        if (!deleted) {
          throw new Error('Failed to delete manual application');
        }
      } else {
        // Delete from database
        const { error } = await supabase
          .from('electoral_applications')
          .delete()
          .eq('id', deletingApplication.id);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Application deleted successfully.",
      });

      fetchApplications();
    } catch (error) {
      console.error('Error deleting application:', error);
      toast({
        title: "Error",
        description: "Failed to delete application.",
        variant: "destructive"
      });
    } finally {
      setShowDeleteDialog(false);
      setDeletingApplication(null);
    }
  };

  const downloadCandidatesList = async () => {
    try {
      setDownloadingCandidates(true);
      const { generateCandidatesListPDF } = await import('@/utils/pdfUtils');
      
      const candidatesData = filteredApplications.map((app) => ({
        name: app.student_name,
        email: app.student_email,
        class: app.class_name,
        stream: app.stream_name,
        position: app.position.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        parentContact: app.parent_tel ? `+256${app.parent_tel}` : '',
        status: app.status.charAt(0).toUpperCase() + app.status.slice(1)
      }));
      
      const doc = await generateCandidatesListPDF(candidatesData, 'Electoral Candidates List - 2025');
      doc.save('Electoral-Candidates-List.pdf');
      
      toast({
        title: "Download Complete",
        description: `Downloaded candidates list with ${filteredApplications.length} entries.`
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Download Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDownloadingCandidates(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.student_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                         app.student_email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                         app.position.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
    
    if (filterType === "all") return matchesSearch;
    
    const [filterCategory, filterValue] = filterType.split("-");
    if (filterCategory === "status") {
      return matchesSearch && app.status === filterValue;
    } else if (filterCategory === "position") {
      return matchesSearch && app.position === filterValue;
    }
    
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedApplications = filteredApplications.slice(startIndex, endIndex);

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filterType]);

  const downloadIndividualApplication = async (application: ElectoralApplication) => {
    setDownloadingApplications(prev => new Set(prev).add(application.id));
    
    try {
      // Create ApplicationPreview component render
      const tempDiv = document.createElement('div');
      tempDiv.id = 'temp-application-preview';
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '800px';
      document.body.appendChild(tempDiv);

      // Import React and render ApplicationPreview
      const { createRoot } = await import('react-dom/client');
      const React = await import('react');
      
      const root = createRoot(tempDiv);
      
      // Render ApplicationPreview with exact same props as student page
      const applicationData = {
        ...application,
        submitted_at: application.created_at
      };
      
      await new Promise<void>((resolve) => {
        root.render(
          React.createElement(ApplicationPreview, {
            application: applicationData,
            showActions: false,
            onClose: undefined
          })
        );
        
        // Wait for render to complete
        setTimeout(resolve, 1000);
      });

      // Generate PDF using html2canvas exactly like ApplicationPreview does
      const element = tempDiv.querySelector('#application-preview-content');
      if (!element) {
        throw new Error('Preview content not found');
      }

      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(element as HTMLElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        allowTaint: false,
        imageTimeout: 0,
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight,
        scrollX: 0,
        scrollY: 0
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Better A4 dimensions with margins - exact same as ApplicationPreview
      const pdfWidth = 210;
      const pdfHeight = 297;
      const margin = 10;
      const contentWidth = pdfWidth - (margin * 2);
      const contentHeight = pdfHeight - (margin * 2);
      
      // Calculate proper scaling to fit content within page
      const imgAspectRatio = canvas.width / canvas.height;
      let imgWidth = contentWidth;
      let imgHeight = contentWidth / imgAspectRatio;
      
      // If height exceeds page, scale down to fit
      if (imgHeight > contentHeight) {
        imgHeight = contentHeight;
        imgWidth = contentHeight * imgAspectRatio;
      }
      
      // Center the image on the page
      const xOffset = margin + (contentWidth - imgWidth) / 2;
      const yOffset = margin;
      
      pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
      
      // Only add pages if content is much larger than one page
      let remainingHeight = imgHeight - contentHeight;
      let currentPage = 1;
      
      while (remainingHeight > 50 && currentPage < 3) { // Limit to max 3 pages
        pdf.addPage();
        const nextPageOffset = yOffset - (contentHeight * currentPage);
        pdf.addImage(imgData, 'PNG', xOffset, nextPageOffset, imgWidth, imgHeight);
        remainingHeight -= contentHeight;
        currentPage++;
      }

      pdf.save(`Electoral-Application-${application.student_name}.pdf`);
      
      toast({
        title: "Download Complete",
        description: `Downloaded ${application.student_name}'s application.`
      });
      
      // Cleanup
      root.unmount();
      document.body.removeChild(tempDiv);
      
    } catch (error) {
      console.error('Error generating individual PDF:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDownloadingApplications(prev => {
        const newSet = new Set(prev);
        newSet.delete(application.id);
        return newSet;
      });
    }
  };

  const downloadBulkApplications = async () => {
    setBulkDownloading(true);
    setDownloadProgress({ current: 0, total: filteredApplications.length, isComplete: false });
    
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      // Bulk download logic with progress tracking - using ApplicationPreview component
      for (let i = 0; i < filteredApplications.length; i++) {
        const application = filteredApplications[i];
        
        // Update progress
        setDownloadProgress({ 
          current: i + 1, 
          total: filteredApplications.length, 
          isComplete: false 
        });
        
        try {
          // Create ApplicationPreview component render
          const tempDiv = document.createElement('div');
          tempDiv.id = `temp-bulk-preview-${i}`;
          tempDiv.style.position = 'absolute';
          tempDiv.style.left = '-9999px';
          tempDiv.style.top = '-9999px';
          tempDiv.style.width = '800px';
          document.body.appendChild(tempDiv);

          // Import React and render ApplicationPreview
          const { createRoot } = await import('react-dom/client');
          const React = await import('react');
          
          const root = createRoot(tempDiv);
          
          // Render ApplicationPreview with exact same props as student page
          const applicationData = {
            ...application,
            submitted_at: application.created_at
          };
          
          await new Promise<void>((resolve) => {
            root.render(
              React.createElement(ApplicationPreview, {
                application: applicationData,
                showActions: false,
                onClose: undefined
              })
            );
            
            // Wait for render to complete
            setTimeout(resolve, 1000);
          });

          // Generate PDF using html2canvas exactly like ApplicationPreview does
          const element = tempDiv.querySelector('#application-preview-content');
          if (!element) {
            throw new Error('Preview content not found');
          }

          const html2canvas = (await import('html2canvas')).default;
          const canvas = await html2canvas(element as HTMLElement, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            allowTaint: false,
            imageTimeout: 0,
            logging: false,
            width: element.scrollWidth,
            height: element.scrollHeight,
            scrollX: 0,
            scrollY: 0
          });

          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');
          
          // Better A4 dimensions with margins - exact same as ApplicationPreview
          const pdfWidth = 210;
          const pdfHeight = 297;
          const margin = 10;
          const contentWidth = pdfWidth - (margin * 2);
          const contentHeight = pdfHeight - (margin * 2);
          
          // Calculate proper scaling to fit content within page
          const imgAspectRatio = canvas.width / canvas.height;
          let imgWidth = contentWidth;
          let imgHeight = contentWidth / imgAspectRatio;
          
          // If height exceeds page, scale down to fit
          if (imgHeight > contentHeight) {
            imgHeight = contentHeight;
            imgWidth = contentHeight * imgAspectRatio;
          }
          
          // Center the image on the page
          const xOffset = margin + (contentWidth - imgWidth) / 2;
          const yOffset = margin;
          
          pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
          
          // Only add pages if content is much larger than one page
          let remainingHeight = imgHeight - contentHeight;
          let currentPage = 1;
          
          while (remainingHeight > 50 && currentPage < 3) { // Limit to max 3 pages
            pdf.addPage();
            const nextPageOffset = yOffset - (contentHeight * currentPage);
            pdf.addImage(imgData, 'PNG', xOffset, nextPageOffset, imgWidth, imgHeight);
            remainingHeight -= contentHeight;
            currentPage++;
          }

          const pdfBlob = pdf.output('blob');
          zip.file(`Electoral-Application-${application.student_name}.pdf`, pdfBlob);
          
          // Cleanup
          root.unmount();
          document.body.removeChild(tempDiv);
          
        } catch (error) {
          console.error(`Error generating PDF for ${application.student_name}:`, error);
        }
        
        // Small delay to allow UI updates
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Mark as complete
      setDownloadProgress({ 
        current: filteredApplications.length, 
        total: filteredApplications.length, 
        isComplete: true 
      });

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Electoral-Applications.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast({
        title: "Download Complete",
        description: `Successfully downloaded ${filteredApplications.length} applications.`
      });
    } catch (error) {
      console.error('Error creating bulk download:', error);
      toast({
        title: "Download Failed",
        description: "Failed to create bulk download. Please try again.",
        variant: "destructive"
      });
    } finally {
      setBulkDownloading(false);
      // Reset progress after modal closes
      setTimeout(() => {
        setDownloadProgress({ current: 0, total: 0, isComplete: false });
      }, 3000);
    }
  };

  const uniquePositions = [...new Set(applications.map(app => app.position))];

  const filterOptions = useMemo(() => {
    const statusOptions = [
      { value: "status-pending", label: "Pending" },
      { value: "status-confirmed", label: "Confirmed" },
      { value: "status-rejected", label: "Rejected" }
    ];
    
    const positionOptions = uniquePositions.map(position => ({
      value: `position-${position}`,
      label: position.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }));

    return [
      { label: "Status", options: statusOptions },
      { label: "Position", options: positionOptions }
    ];
  }, [uniquePositions]);

  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    confirmed: applications.filter(app => app.status === 'confirmed').length,
    rejected: applications.filter(app => app.status === 'rejected').length
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen overflow-x-hidden">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
            <span>Loading electoral applications...</span>
          </div>
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
      <div className="w-full min-h-screen overflow-x-hidden">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 max-w-7xl">
          <div className="space-y-4 sm:space-y-6">
            {/* Modern Header */}
            <ProfessionalCard variant="elevated" className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardHeader className="pb-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        Electoral Applications
                      </h1>
                      <p className="text-muted-foreground text-sm mt-1">
                        Manage student applications for leadership positions
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    <ProfessionalButton 
                      onClick={() => setShowAddModal(true)}
                      size="sm"
                      className="gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="truncate">Add Prefect</span>
                    </ProfessionalButton>
                    <ProfessionalButton 
                      onClick={downloadCandidatesList}
                      disabled={downloadingCandidates}
                      size="sm"
                      className="gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                      {downloadingCandidates ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      <span className="truncate">{downloadingCandidates ? 'Processing...' : 'Download Candidates List'}</span>
                    </ProfessionalButton>
                    <ProfessionalButton 
                      onClick={downloadBulkApplications} 
                      disabled={bulkDownloading} 
                      size="sm"
                      className="gap-2 bg-primary hover:bg-primary/90"
                    >
                      {bulkDownloading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      <span className="truncate">{bulkDownloading ? 'Processing...' : 'Download Bulk Applications'}</span>
                    </ProfessionalButton>
                    <ProfessionalButton 
                      onClick={() => navigate('/admin/ballot-generation')}
                      size="sm"
                      className="gap-2 bg-purple-600 hover:bg-purple-700"
                    >
                      <Vote className="h-4 w-4" />
                      <span className="truncate">Generate Ballots</span>
                    </ProfessionalButton>
                  </div>
                </div>
              </CardHeader>
            </ProfessionalCard>

            {/* Modern Stats Grid */}
            <div className="w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <ProfessionalCard variant="elevated" className="border-l-4 border-l-blue-500">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Applications</CardTitle>
                      <div className="p-2 rounded-lg bg-blue-100">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                  </CardContent>
                </ProfessionalCard>
                
                <ProfessionalCard variant="elevated" className="border-l-4 border-l-yellow-500">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
                      <div className="p-2 rounded-lg bg-yellow-100">
                        <Clock className="h-4 w-4 text-yellow-600" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                  </CardContent>
                </ProfessionalCard>
                
                <ProfessionalCard variant="elevated" className="border-l-4 border-l-green-500">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Confirmed</CardTitle>
                      <div className="p-2 rounded-lg bg-green-100">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
                  </CardContent>
                </ProfessionalCard>
                
                <ProfessionalCard variant="elevated" className="border-l-4 border-l-red-500">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
                      <div className="p-2 rounded-lg bg-red-100">
                        <XCircle className="h-4 w-4 text-red-600" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                  </CardContent>
                </ProfessionalCard>
              </div>
            </div>

            {/* Modern Search & Filters */}
            <ProfessionalCard variant="elevated" className="bg-muted/20">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Filter className="h-4 w-4 text-primary" />
                  </div>
                  <span>Search & Filters</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name, email, or position..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full h-11 border-2 focus:border-primary/50"
                      />
                    </div>
                  </div>
                  <div className="w-full sm:w-64">
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="h-11 border-2 focus:border-primary/50">
                        <SelectValue placeholder="All Filters" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Applications</SelectItem>
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
                </div>
              </CardContent>
            </ProfessionalCard>

            {/* Applications List */}
            <div className="w-full min-w-0">
              {paginatedApplications.length === 0 ? (
                <Card className="w-full">
                  <CardContent className="py-8 sm:py-12 text-center">
                    <Users className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-base sm:text-lg font-medium mb-2">No Applications Found</h3>
                    <p className="text-muted-foreground text-sm">
                      {applications.length === 0 
                        ? "No electoral applications have been submitted yet."
                        : "No applications match your current filters."
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {paginatedApplications.map((application) => {
                    // Manually set photos for specific candidates
                    let photo = application.student_photo || "/src/assets/default-avatar.png";
                    const name = application.student_name?.toUpperCase() || '';
                    
                    if (name.includes('JANAT') || name.includes('KALIBBALA')) {
                      photo = '/janat.jpg';
                    } else if (name.includes('SHANNAH') || name.includes('NAKASUJJA')) {
                      photo = '/shannah.jpg';
                    }
                    
                    return (
                    <ProfessionalCard key={application.id} variant="bordered" className="group hover:shadow-lg">
                      <CardContent className="p-6">
                          <div className="w-full">
                            <div className="flex flex-col space-y-5">
                              {/* Enhanced Header Row */}
                              <div className="flex items-start gap-4 min-w-0">
                                <div className="relative">
                                  <img
                                    src={photo}
                                    alt={`${application.student_name}'s photo`}
                                    className="w-14 h-14 rounded-xl object-cover border-2 border-muted shadow-sm group-hover:border-primary/30 transition-colors"
                                    onError={(e) => {
                                      e.currentTarget.src = "/src/assets/default-avatar.png";
                                    }}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                    <div className="min-w-0 flex-1 space-y-1">
                                      <h3 className="font-semibold text-lg leading-tight break-words group-hover:text-primary transition-colors">
                                        {application.student_name}
                                      </h3>
                                      <p className="text-muted-foreground text-sm break-all">
                                        {application.student_email}
                                      </p>
                                    </div>
                                    <Badge 
                                      className={`${getStatusColor(application.status)} shrink-0 px-3 py-1.5 font-medium shadow-sm`}
                                      variant="secondary"
                                    >
                                      {getStatusIcon(application.status)}
                                      <span className="ml-2 capitalize">{application.status}</span>
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              {/* Enhanced Application Details */}
                              <div className="bg-muted/20 rounded-lg p-4 space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Position Applied</label>
                                    <p className="font-semibold text-sm text-primary">
                                      {application.position.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </p>
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Class & Stream</label>
                                    <p className="font-semibold text-sm">
                                      {application.class_name} - {application.stream_name}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Enhanced Action Buttons */}
                              <div className="flex flex-col gap-3 pt-2">
                                {/* View, Download, Edit and Delete Buttons */}
                                 <div className="flex flex-col sm:flex-row gap-3">
                                   <ProfessionalButton 
                                     size="sm" 
                                     variant="outline"
                                     onClick={() => {
                                       setSelectedApplication(application);
                                       setShowFormalPreview(true);
                                     }}
                                     className="flex-1 font-medium border-2 hover:border-primary/50"
                                   >
                                     <FileText className="h-4 w-4 mr-2" />
                                     View Application
                                   </ProfessionalButton>
                                  <ProfessionalButton 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => downloadIndividualApplication(application)}
                                    disabled={downloadingApplications.has(application.id)}
                                    className="flex-1 font-medium border-2 hover:border-primary/50"
                                  >
                                    {downloadingApplications.has(application.id) ? (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                      <Download className="h-4 w-4 mr-2" />
                                    )}
                                    {downloadingApplications.has(application.id) ? 'Preparing...' : 'Download PDF'}
                                  </ProfessionalButton>
                                  <ProfessionalButton 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      setEditingApplication(application);
                                      setShowEditModal(true);
                                    }}
                                    className="flex-1 font-medium border-2 hover:border-blue-500/50"
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </ProfessionalButton>
                                  <ProfessionalButton 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => {
                                      setDeletingApplication(application);
                                      setShowDeleteDialog(true);
                                    }}
                                    className="flex-1 sm:flex-none font-medium"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </ProfessionalButton>
                                </div>
                              
                                {/* Enhanced Status-specific buttons */}
                                {application.status === 'pending' && (
                                  <div className="flex flex-col sm:flex-row gap-3">
                                    <ProfessionalButton 
                                      size="sm" 
                                      className="bg-green-600 hover:bg-green-700 text-white flex-1 font-medium"
                                      onClick={() => updateApplicationStatus(application.id, 'confirmed')}
                                      disabled={updating === application.id}
                                    >
                                      {updating === application.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                      ) : (
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                      )}
                                      {updating === application.id ? 'Processing...' : 'Accept'}
                                    </ProfessionalButton>
                                    <ProfessionalButton 
                                      size="sm" 
                                      variant="destructive"
                                      onClick={() => updateApplicationStatus(application.id, 'rejected')}
                                      disabled={updating === application.id}
                                      className="flex-1 font-medium"
                                    >
                                      {updating === application.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                      ) : (
                                        <XCircle className="h-4 w-4 mr-2" />
                                      )}
                                      {updating === application.id ? 'Processing...' : 'Reject'}
                                    </ProfessionalButton>
                                  </div>
                                )}
                                
                                {application.status === 'confirmed' && (
                                  <div className="flex items-center justify-center gap-3 px-4 py-3 bg-green-50 text-green-700 rounded-lg border border-green-200 font-medium">
                                    <div className="p-1 rounded-full bg-green-100">
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    </div>
                                    Application Accepted
                                  </div>
                                )}
                                
                                {application.status === 'rejected' && (
                                  <div className="flex items-center justify-center gap-3 px-4 py-3 bg-red-50 text-red-700 rounded-lg border border-red-200 font-medium">
                                    <div className="p-1 rounded-full bg-red-100">
                                      <XCircle className="h-4 w-4 text-red-600" />
                                    </div>
                                    Application Rejected
                                  </div>
                                )}
                            </div>
                            </div>
                          </div>
                        </CardContent>
                      </ProfessionalCard>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center w-full overflow-x-auto py-2">
                <Pagination>
                  <PaginationContent className="flex-wrap">
                     <PaginationItem>
                       <PaginationPrevious 
                         onClick={(e) => {
                           e.preventDefault();
                           if (currentPage > 1) setCurrentPage(currentPage - 1);
                         }}
                         className={`text-xs sm:text-sm ${currentPage === 1 ? "pointer-events-none opacity-50" : ""}`}
                       />
                     </PaginationItem>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let page;
                      if (totalPages <= 5) {
                        page = i + 1;
                      } else if (currentPage <= 3) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                      } else {
                        page = currentPage - 2 + i;
                      }
                      
                      return (
                         <PaginationItem key={page}>
                           <PaginationLink
                             onClick={(e) => {
                               e.preventDefault();
                               setCurrentPage(page);
                             }}
                             isActive={currentPage === page}
                             className="text-xs sm:text-sm"
                           >
                             {page}
                           </PaginationLink>
                         </PaginationItem>
                      );
                    })}
                    
                     <PaginationItem>
                       <PaginationNext 
                         onClick={(e) => {
                           e.preventDefault();
                           if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                         }}
                         className={`text-xs sm:text-sm ${currentPage === totalPages ? "pointer-events-none opacity-50" : ""}`}
                       />
                     </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Formal Application Preview Modal */}
        {selectedApplication && showFormalPreview && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
            <div className="w-full max-w-5xl max-h-[95vh] overflow-hidden bg-white rounded-lg shadow-2xl">
              {/* Modal Header */}
              <div className="p-3 sm:p-4 md:p-6 border-b bg-gradient-to-r from-orange-500 to-orange-600 text-white flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-white/20 shrink-0">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-base sm:text-lg md:text-xl truncate">Formal Application Letter</h3>
                    <p className="text-xs sm:text-sm text-white/80 truncate">
                      {selectedApplication.student_name} - {selectedApplication.position.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  <ProfessionalButton 
                    onClick={() => downloadIndividualApplication(selectedApplication)} 
                    disabled={downloadingApplications.has(selectedApplication.id)}
                    size="sm"
                    variant="outline"
                    className="font-medium border-white text-white hover:bg-white hover:text-orange-600 hidden sm:flex"
                  >
                    {downloadingApplications.has(selectedApplication.id) ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    {downloadingApplications.has(selectedApplication.id) ? 'Preparing...' : 'Download PDF'}
                  </ProfessionalButton>
                  
                  {/* Mobile download button - icon only */}
                  <ProfessionalButton 
                    onClick={() => downloadIndividualApplication(selectedApplication)} 
                    disabled={downloadingApplications.has(selectedApplication.id)}
                    size="sm"
                    variant="outline"
                    className="font-medium border-white text-white hover:bg-white hover:text-orange-600 sm:hidden shrink-0"
                  >
                    {downloadingApplications.has(selectedApplication.id) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                  </ProfessionalButton>
                  <ProfessionalButton 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setShowFormalPreview(false);
                      setSelectedApplication(null);
                    }}
                    className="shrink-0 text-white hover:bg-white/20 hover:text-white"
                  >
                    <XCircle className="h-5 w-5" />
                  </ProfessionalButton>
                </div>
              </div>
              
              {/* Scrollable Content */}
              <div className="max-h-[calc(95vh-120px)] overflow-y-auto p-4 sm:p-6">
                <ApplicationPreview 
                  application={selectedApplication} 
                  showActions={false}
                />
              </div>
            </div>
          </div>
        )}

        {/* Download Progress Modal */}
        <DownloadProgressModal
          isOpen={bulkDownloading}
          onClose={() => setBulkDownloading(false)}
          totalItems={downloadProgress.total}
          currentItem={downloadProgress.current}
          isComplete={downloadProgress.isComplete}
        />

        {/* Add Prefect Modal */}
        <AddPrefectModal
          open={showAddModal}
          onOpenChange={setShowAddModal}
          onSuccess={fetchApplications}
        />

        {/* Edit Prefect Modal */}
        <EditPrefectModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          application={editingApplication}
          onSuccess={fetchApplications}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Application</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {deletingApplication?.student_name}'s application for {deletingApplication?.position}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteApplication} className="bg-destructive hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
