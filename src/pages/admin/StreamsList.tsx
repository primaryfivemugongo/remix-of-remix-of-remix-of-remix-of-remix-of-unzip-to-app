import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Download, 
  ArrowLeft,
  Loader2,
  Building,
  Users,
  BookOpen,
  FileText
} from "lucide-react";
import { useNavigate } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";

interface Stream {
  id: string;
  name: string;
  description?: string;
  class_id?: string;
  created_at: string;
  updated_at: string;
}

interface StreamWithCounts extends Stream {
  studentCount: number;
  className?: string;
}

export default function StreamsList() {
  const navigate = useNavigate();
  const { userName, photoUrl } = useAuth();
  const [streams, setStreams] = useState<StreamWithCounts[]>([]);
  const [filteredStreams, setFilteredStreams] = useState<StreamWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  
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
    fetchStreams();
  }, []);

  useEffect(() => {
    filterStreams();
  }, [streams, debouncedSearchTerm, filterType]);

  const fetchStreams = async () => {
    try {
      setLoading(true);
      
      // Fetch classes first
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('id, name');

      if (classesError) {
        console.error('Error fetching classes:', classesError);
      } else {
        setClasses(classesData || []);
      }
      
      // Fetch streams
      const { data: streamsData, error: streamsError } = await supabase
        .from('streams')
        .select('*')
        .order('created_at', { ascending: false });

      if (streamsError) {
        console.error('Error fetching streams:', streamsError);
        toast.error('Failed to fetch streams');
        return;
      }

      // Fetch student counts for each stream and add class names
      const streamsWithCounts = await Promise.all(
        (streamsData || []).map(async (stream) => {
          const { data: studentData } = await supabase
            .from('students')
            .select('id')
            .eq('stream_id', stream.id);

          const className = classesData?.find(c => c.id === stream.id)?.name;

          return {
            ...stream,
            studentCount: studentData?.length || 0,
            className
          };
        })
      );

      setStreams(streamsWithCounts);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to fetch streams');
    } finally {
      setLoading(false);
    }
  };

  const filterStreams = () => {
    let filtered = streams;

    // Search filter
    if (debouncedSearchTerm) {
      filtered = filtered.filter(stream =>
        stream.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        stream.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        stream.id?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        stream.className?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    // Advanced filters
    if (filterType !== "all") {
      const [filterCategory, filterValue] = filterType.split("-");
      
      if (filterCategory === "class") {
        filtered = filtered.filter(stream => stream.class_id === filterValue);
      }
    }

    setFilteredStreams(filtered);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Streams Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
    doc.text(`Total Streams: ${filteredStreams.length}`, 20, 40);

    const tableData = filteredStreams.map(stream => [
      stream.name || 'No Name',
      stream.className || 'No Class',
      stream.description || 'No Description',
      stream.studentCount.toString()
    ]);

    (doc as any).autoTable({
      head: [['Stream Name', 'Class', 'Description', 'Students']],
      body: tableData,
      startY: 50,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save('streams-report.pdf');
  };

  const filterOptions = useMemo(() => {
    const classOptions = classes.map(classItem => ({
      value: `class-${classItem.id}`,
      label: classItem.name
    }));

    return [
      { label: "Class", options: classOptions }
    ];
  }, [classes]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading streams...</p>
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Streams List</h1>
            <p className="text-muted-foreground">
              Total: {filteredStreams.length} of {streams.length} streams
            </p>
          </div>
          <Button onClick={downloadPDF} className="gap-2">
            <FileText className="h-4 w-4" />
            Download PDF
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, description, class, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Filters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Streams</SelectItem>
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

      {/* Streams Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {filteredStreams.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="text-center py-8">
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No streams found</p>
              <p className="text-muted-foreground">No streams match your search criteria.</p>
            </CardContent>
          </Card>
        ) : (
          filteredStreams.map((stream) => (
            <Card key={stream.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg truncate">{stream.name || 'Unnamed Stream'}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1 truncate">ID: {stream.id}</p>
                  </div>
                  <Building className="h-5 w-5 text-primary flex-shrink-0" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stream.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{stream.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    {stream.className && (
                      <Badge variant="outline" className="flex items-center gap-1 text-xs">
                        <BookOpen className="h-3 w-3" />
                        <span className="truncate">{stream.className}</span>
                      </Badge>
                    )}
                    <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                      <Users className="h-3 w-3" />
                      {stream.studentCount} Students
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      Created: {new Date(stream.created_at).toLocaleDateString()}
                    </Badge>
                    {stream.updated_at !== stream.created_at && (
                      <Badge variant="secondary" className="text-xs">
                        Updated: {new Date(stream.updated_at).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => navigate(`/admin/students?stream=${stream.id}`)}>
                      View Students
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary Table - Desktop Only */}
      <Card className="hidden lg:block">
        <CardHeader>
          <CardTitle>Streams Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stream Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStreams.map((stream) => (
                  <TableRow key={stream.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{stream.name || 'Unnamed Stream'}</p>
                        <p className="text-xs text-muted-foreground">{stream.id}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {stream.className ? (
                        <Badge variant="outline">{stream.className}</Badge>
                      ) : (
                        <span className="text-muted-foreground">No class</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm max-w-xs truncate">{stream.description || 'No description'}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{stream.studentCount}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(stream.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => navigate(`/admin/students?stream=${stream.id}`)}>
                          View Students
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  );
}