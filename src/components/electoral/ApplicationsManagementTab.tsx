import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfessionalCard } from "@/components/ui/professional-card";
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
  CheckCircle,
  XCircle,
  Clock,
  Users,
  FileText,
  Loader2,
  Download,
  Plus,
  Edit,
  Trash2,
  Vote
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ApplicationPreview from "@/components/electoral/ApplicationPreview";
import AddPrefectModal from "@/components/electoral/AddPrefectModal";
import EditPrefectModal from "@/components/electoral/EditPrefectModal";
import { useNavigate } from "@/lib/router-compat";
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
import { DownloadProgressModal } from "@/components/ui/download-progress-modal";
import { formatInTimeZone } from 'date-fns-tz';

const headerImage = "/header.png";

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
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export function ApplicationsManagementTab() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<ElectoralApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState<ElectoralApplication | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [showFormalPreview, setShowFormalPreview] = useState(false);
  const [bulkDownloading, setBulkDownloading] = useState(false);
  const [downloadingApplications, setDownloadingApplications] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0, isComplete: false });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingApplication, setEditingApplication] = useState<ElectoralApplication | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingApplication, setDeletingApplication] = useState<ElectoralApplication | null>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchApplications();
    
    const channel = supabase
      .channel('electoral-applications-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'electoral_applications'
      }, () => {
        fetchApplications();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('electoral_applications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setApplications((data || []) as ElectoralApplication[]);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: "Failed to fetch applications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch = 
        app.student_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        app.position.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        app.class_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      
      const matchesFilter = filterType === "all" || app.status === filterType;
      
      return matchesSearch && matchesFilter;
    });
  }, [applications, debouncedSearchTerm, filterType]);

  const paginatedApplications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredApplications.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredApplications, currentPage]);

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
    try {
      setUpdating(id);
      const { error } = await supabase
        .from('electoral_applications')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Application ${status} successfully`
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive"
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleEdit = (application: ElectoralApplication) => {
    setEditingApplication(application);
    setShowEditModal(true);
  };

  const handleDeleteClick = (application: ElectoralApplication) => {
    setDeletingApplication(application);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingApplication) return;
    
    try {
      const { error } = await supabase
        .from('electoral_applications')
        .delete()
        .eq('id', deletingApplication.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Application deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting application:', error);
      toast({
        title: "Error",
        description: "Failed to delete application",
        variant: "destructive"
      });
    } finally {
      setShowDeleteDialog(false);
      setDeletingApplication(null);
    }
  };

  const downloadApplicationPDF = async (application: ElectoralApplication) => {
    try {
      setDownloadingApplications(prev => new Set([...prev, application.id]));
      
      const doc = new jsPDF();
      
      // Add header
      doc.addImage(headerImage, 'PNG', 10, 10, 190, 30);
      doc.setFontSize(16);
      doc.text('Electoral Application Form', 105, 50, { align: 'center' });
      
      // Add application details
      doc.setFontSize(12);
      let yPos = 70;
      
      const details = [
        ['Student Name:', application.student_name],
        ['Position:', application.position],
        ['Class:', `${application.class_name} - ${application.stream_name}`],
        ['Status:', application.status.toUpperCase()],
        ['Applied:', formatInTimeZone(new Date(application.created_at), 'Africa/Kampala', 'MMM dd, yyyy HH:mm')],
      ];
      
      details.forEach(([label, value]) => {
        doc.text(label, 20, yPos);
        doc.text(value, 80, yPos);
        yPos += 10;
      });
      
      doc.save(`${application.student_name}_application.pdf`);
      
      toast({
        title: "Success",
        description: "Application downloaded successfully"
      });
    } catch (error) {
      console.error('Error downloading application:', error);
      toast({
        title: "Error",
        description: "Failed to download application",
        variant: "destructive"
      });
    } finally {
      setDownloadingApplications(prev => {
        const next = new Set(prev);
        next.delete(application.id);
        return next;
      });
    }
  };

  const stats = useMemo(() => {
    const pending = applications.filter(a => a.status === 'pending').length;
    const approved = applications.filter(a => a.status === 'approved').length;
    const rejected = applications.filter(a => a.status === 'rejected').length;
    
    return [
      { title: "Total Applications", value: applications.length, icon: FileText, color: "text-blue-500" },
      { title: "Pending Review", value: pending, icon: Clock, color: "text-orange-500" },
      { title: "Approved", value: approved, icon: CheckCircle, color: "text-green-500" },
      { title: "Rejected", value: rejected, icon: XCircle, color: "text-red-500" }
    ];
  }, [applications]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <ProfessionalCard key={stat.title} variant="elevated">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </ProfessionalCard>
          );
        })}
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setShowAddModal(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Prefect
              </Button>
              <Button 
                onClick={() => navigate('/admin/ballot-generation')} 
                className="gap-2"
                variant="default"
              >
                <Vote className="h-4 w-4" />
                Generate Ballots
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="grid gap-4">
        {paginatedApplications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Applications Found</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterType !== "all" 
                  ? "Try adjusting your filters" 
                  : "No applications have been submitted yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          paginatedApplications.map((app) => (
            <ProfessionalCard key={app.id} variant="bordered">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{app.student_name}</h3>
                        <p className="text-sm text-muted-foreground">{app.student_email}</p>
                      </div>
                      <Badge 
                        variant={
                          app.status === 'approved' ? 'default' : 
                          app.status === 'pending' ? 'secondary' : 
                          'destructive'
                        }
                      >
                        {app.status}
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>Position: {app.position}</span>
                      <span>Class: {app.class_name} - {app.stream_name}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedApplication(app);
                        setShowFormalPreview(true);
                      }}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadApplicationPDF(app)}
                      disabled={downloadingApplications.has(app.id)}
                    >
                      {downloadingApplications.has(app.id) ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(app)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(app)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    
                    {app.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleStatusUpdate(app.id, 'approved')}
                          disabled={updating === app.id}
                        >
                          {updating === app.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-1" />
                          )}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusUpdate(app.id, 'rejected')}
                          disabled={updating === app.id}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </ProfessionalCard>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Modals */}
      {showFormalPreview && selectedApplication && (
        <ApplicationPreview
          application={selectedApplication}
          onClose={() => {
            setShowFormalPreview(false);
            setSelectedApplication(null);
          }}
        />
      )}

      <AddPrefectModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSuccess={() => fetchApplications()}
      />

      {editingApplication && (
        <EditPrefectModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          application={editingApplication as any}
          onSuccess={() => fetchApplications()}
        />
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this application? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DownloadProgressModal 
        isOpen={downloadProgress.current > 0 && !downloadProgress.isComplete}
        totalItems={downloadProgress.total}
        currentItem={downloadProgress.current}
        isComplete={downloadProgress.isComplete}
        onClose={() => setDownloadProgress({ current: 0, total: 0, isComplete: false })}
      />
    </div>
  );
}
