import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  BookOpen,
  Users,
  FileText
} from "lucide-react";
import { useNavigate } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";

interface Class {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface ClassWithCounts extends Class {
  studentCount: number;
  streamCount: number;
}

export default function ClassesList() {
  const navigate = useNavigate();
  const { userName, photoUrl } = useAuth();
  const [classes, setClasses] = useState<ClassWithCounts[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<ClassWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  
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
    fetchClasses();
  }, []);

  useEffect(() => {
    filterClasses();
  }, [classes, debouncedSearchTerm]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      
      // Fetch classes
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('*')
        .order('created_at', { ascending: false });

      if (classesError) {
        console.error('Error fetching classes:', classesError);
        toast.error('Failed to fetch classes');
        return;
      }

      // Fetch student counts for each class
      const classesWithCounts = await Promise.all(
        (classesData || []).map(async (classItem) => {
          const [studentCountResult, streamCountResult] = await Promise.all([
            supabase
              .from('students')
              .select('id')
              .eq('class_id', classItem.id),
            supabase
              .from('streams')
              .select('id')
          ]);

          return {
            ...classItem,
            studentCount: studentCountResult.data?.length || 0,
            streamCount: streamCountResult.data?.length || 0
          };
        })
      );

      setClasses(classesWithCounts);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  };

  const filterClasses = () => {
    let filtered = classes;

    // Search filter
    if (debouncedSearchTerm) {
      filtered = filtered.filter(classItem =>
        classItem.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        classItem.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        classItem.id?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    setFilteredClasses(filtered);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Classes Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
    doc.text(`Total Classes: ${filteredClasses.length}`, 20, 40);

    const tableData = filteredClasses.map(classItem => [
      classItem.name || 'No Name',
      classItem.description || 'No Description',
      classItem.studentCount.toString(),
      classItem.streamCount.toString()
    ]);

    (doc as any).autoTable({
      head: [['Class Name', 'Description', 'Students', 'Streams']],
      body: tableData,
      startY: 50,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save('classes-report.pdf');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading classes...</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Classes List</h1>
            <p className="text-muted-foreground">
              Total: {filteredClasses.length} of {classes.length} classes
            </p>
          </div>
          <Button onClick={downloadPDF} className="gap-2">
            <FileText className="h-4 w-4" />
            Download PDF
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, description, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

      {/* Classes Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredClasses.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No classes found</p>
              <p className="text-muted-foreground">No classes match your search criteria.</p>
            </CardContent>
          </Card>
        ) : (
          filteredClasses.map((classItem) => (
            <Card key={classItem.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{classItem.name || 'Unnamed Class'}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">ID: {classItem.id}</p>
                  </div>
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {classItem.description && (
                    <p className="text-sm text-muted-foreground">{classItem.description}</p>
                  )}
                  
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{classItem.studentCount}</span>
                      <span className="text-xs text-muted-foreground">Students</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{classItem.streamCount}</span>
                      <span className="text-xs text-muted-foreground">Streams</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      Created: {new Date(classItem.created_at).toLocaleDateString()}
                    </Badge>
                    {classItem.updated_at !== classItem.created_at && (
                      <Badge variant="secondary">
                        Updated: {new Date(classItem.updated_at).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => navigate(`/admin/students?class=${classItem.id}`)}>
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
          <CardTitle>Classes Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Streams</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClasses.map((classItem) => (
                  <TableRow key={classItem.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{classItem.name || 'Unnamed Class'}</p>
                        <p className="text-xs text-muted-foreground">{classItem.id}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm max-w-xs truncate">{classItem.description || 'No description'}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{classItem.studentCount}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{classItem.streamCount}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(classItem.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => navigate(`/admin/students?class=${classItem.id}`)}>
                        View Students
                      </Button>
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