import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "@/lib/router-compat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Search, Filter, Users } from "lucide-react";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";

interface Application {
  id: string;
  student_name: string;
  student_email: string;
  student_photo?: string;
  position: string;
  class_name: string;
  stream_name: string;
  status: string;
  submitted_at: string;
}

const ITEMS_PER_PAGE = 5;

export default function Candidates() {
  const { position } = useParams<{ position: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userName, userRole, photoUrl } = useAuth();
  
  const handleLogout = () => {
    navigate('/login');
  };
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedStream, setSelectedStream] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Get unique classes and streams from applications
  const availableClasses = useMemo(() => {
    const classes = [...new Set(applications.map(app => app.class_name))].filter(Boolean);
    return classes.sort();
  }, [applications]);

  const availableStreams = useMemo(() => {
    const streams = [...new Set(applications.map(app => app.stream_name))].filter(Boolean);
    return streams.sort();
  }, [applications]);

  // Filter applications based on search and filters
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = searchTerm === "" || 
        app.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.student_email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesClass = selectedClass === "all" || app.class_name === selectedClass;
      const matchesStream = selectedStream === "all" || app.stream_name === selectedStream;
      
      return matchesSearch && matchesClass && matchesStream;
    });
  }, [applications, searchTerm, selectedClass, selectedStream]);

  // Paginate filtered applications
  const totalPages = Math.ceil(filteredApplications.length / ITEMS_PER_PAGE);
  const paginatedApplications = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredApplications.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredApplications, currentPage]);

  const positionTitles = {
    "head_prefect": "HEAD PREFECT",
    "academic_prefect": "ACADEMIC PREFECT",
    "head_monitors": "HEAD MONITOR(ES)",
    "welfare_prefect": "WELFARE PREFECT (MESS PREFECT)",
    "entertainment_prefect": "ENTERTAINMENT PREFECT",
    "games_sports_prefect": "GAMES AND SPORTS PREFECT",
    "health_sanitation": "HEALTH & SANITATION",
    "uniform_uniformity": "UNIFORM & UNIFORMITY",
    "time_keeper": "TIME KEEPER",
    "ict_prefect": "ICT PREFECT",
    "furniture_prefect": "FURNITURE PREFECT(S)",
    "upper_section_prefect": "PREFECT FOR UPPER SECTION",
    "lower_section_prefect": "PREFECT FOR LOWER SECTION",
    "discipline_prefect": "PREFECT IN CHARGE OF DISCIPLINE"
  };

  const positionTitle = positionTitles[position as keyof typeof positionTitles] || position?.replace(/_/g, ' ').toUpperCase();

  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        
        // Load applications from database
        const { data: applicationsData, error } = await supabase
          .from('electoral_applications')
          .select('*')
          .eq('position', position)
          .order('submitted_at', { ascending: false });
        
        if (error) throw error;
        
        const apps: Application[] = applicationsData?.map(app => {
          // Manually set photos for specific candidates
          let photo = app.student_photo;
          const name = app.student_name?.toUpperCase() || '';
          
          if (name.includes('JANAT') || name.includes('KALIBBALA')) {
            photo = '/janat.jpg';
          } else if (name.includes('SHANNAH') || name.includes('NAKASUJJA')) {
            photo = '/shannah.jpg';
          }
          
          return {
            id: app.id,
            student_name: app.student_name,
            student_email: app.student_email,
            student_photo: photo,
            position: app.position,
            class_name: app.class_name,
            stream_name: app.stream_name,
            status: app.status,
            submitted_at: app.submitted_at
          };
        }) || [];
        
        setApplications(apps);
      } catch (error) {
        console.error('Error loading applications:', error);
        toast({
          title: "Error",
          description: "Failed to load candidate applications",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (position) {
      loadApplications();
      
      // Set up real-time subscription for status changes
      const channel = supabase
        .channel('candidate-status-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'electoral_applications',
            filter: `position=eq.${position}`
          },
          (payload) => {
            console.log('Real-time update received:', payload);
            // Update the specific application in state
            if (payload.new) {
              setApplications(apps => 
                apps.map(app => 
                  app.id === payload.new.id 
                    ? { ...app, status: payload.new.status }
                    : app
                )
              );
              
              // Show toast notification for status change
              const statusText = payload.new.status === 'confirmed' ? 'confirmed' : 
                               payload.new.status === 'rejected' ? 'rejected' : 'updated';
              toast({
                title: "Status Updated",
                description: `${payload.new.student_name}'s application has been ${statusText}.`,
              });
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [position, toast]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedClass, selectedStream]);

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading candidates...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout 
      userRole={userRole} 
      userName={userName || ''} 
      photoUrl={photoUrl} 
      onLogout={handleLogout}
    >
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/student/electoral')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Electoral
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Users className="h-6 w-6 text-primary" />
                Candidates for {positionTitle}
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-sm">
                    {filteredApplications.length} {filteredApplications.length === 1 ? 'Candidate' : 'Candidates'}
                  </Badge>
                  {applications.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        {applications.filter(app => app.status === 'confirmed').length} Confirmed
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        {applications.filter(app => app.status === 'rejected').length} Rejected
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        {applications.filter(app => app.status === 'pending').length} Pending
                      </span>
                    </div>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {availableClasses.map(className => (
                        <SelectItem key={className} value={className}>{className}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedStream} onValueChange={setSelectedStream}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Stream" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Streams</SelectItem>
                      {availableStreams.map(streamName => (
                        <SelectItem key={streamName} value={streamName}>{streamName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Candidates List */}
              <div className="space-y-4">
                {paginatedApplications.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No candidates found</h3>
                    <p className="text-muted-foreground">
                      {filteredApplications.length === 0 && searchTerm === "" && selectedClass === "all" && selectedStream === "all" 
                        ? `No applications have been submitted for ${positionTitle} yet.`
                        : "Try adjusting your search or filter criteria."
                      }
                    </p>
                  </div>
                ) : (
                  paginatedApplications.map((application) => (
                    <Card key={application.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={application.student_photo} alt={application.student_name} />
                            <AvatarFallback className="text-lg font-medium">
                              {getInitials(application.student_name)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-lg font-semibold">{application.student_name}</h3>
                                <p className="text-sm text-muted-foreground">{application.student_email}</p>
                              </div>
                              <Badge 
                                variant={
                                  application.status === 'pending' ? 'secondary' : 
                                  application.status === 'confirmed' ? 'default' : 
                                  'destructive'
                                }
                                className={`capitalize font-medium ${
                                  application.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
                                  application.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' :
                                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                                }`}
                              >
                                {application.status === 'confirmed' ? 'Confirmed' : 
                                 application.status === 'rejected' ? 'Rejected' : 
                                 'Pending'}
                              </Badge>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 text-sm">
                              <Badge variant="outline">
                                {application.class_name}
                              </Badge>
                              <Badge variant="outline">
                                {application.stream_name}
                              </Badge>
                              <span className="text-muted-foreground">
                                Applied: {formatDate(application.submitted_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1;
                        const isCurrentPage = page === currentPage;
                        const shouldShow = page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                        
                        if (!shouldShow) {
                          if (page === currentPage - 2 || page === currentPage + 2) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationEllipsis />
                              </PaginationItem>
                            );
                          }
                          return null;
                        }
                        
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={isCurrentPage}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}