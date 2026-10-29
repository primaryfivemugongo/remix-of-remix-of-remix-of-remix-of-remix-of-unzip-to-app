import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@/lib/router-compat";
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Plus,
  Search,
  Filter,
  Eye,
  Settings,
  Award,
  UserCheck
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Class {
  id: string;
  name: string;
  description: string;
  streams: Stream[];
}

interface Stream {
  id: string;
  name: string;
  class_id: string;
  studentCount?: number;
}

// Mock data based on the CSV files
const mockClasses: Class[] = [
  {
    id: 'P1',
    name: 'Primary 1',
    description: 'Foundation year focusing on basic literacy and numeracy skills',
    streams: [
      { id: 'P1-PEARLS', name: 'PEARLS', class_id: 'P1', studentCount: 28 },
      { id: 'P1-STARS', name: 'STARS', class_id: 'P1', studentCount: 26 },
      { id: 'P1-DIAMONDS', name: 'DIAMONDS', class_id: 'P1', studentCount: 29 }
    ]
  },
  {
    id: 'P2',
    name: 'Primary 2',
    description: 'Building on foundational skills with advanced reading and mathematics',
    streams: [
      { id: 'P2-GOLDEN', name: 'GOLDEN', class_id: 'P2', studentCount: 27 },
      { id: 'P2-KITES', name: 'KITES', class_id: 'P2', studentCount: 25 },
      { id: 'P2-MARIGOLD', name: 'MARIGOLD', class_id: 'P2', studentCount: 30 }
    ]
  },
  {
    id: 'P3',
    name: 'Primary 3',
    description: 'Intermediate level with introduction to science and social studies',
    streams: [
      { id: 'P3-CRANES', name: 'CRANES', class_id: 'P3', studentCount: 24 },
      { id: 'P3-PARROTS', name: 'PARROTS', class_id: 'P3', studentCount: 28 },
      { id: 'P3-SPARROWS', name: 'SPARROWS', class_id: 'P3', studentCount: 26 }
    ]
  },
  {
    id: 'P4',
    name: 'Primary 4',
    description: 'Advanced primary education with specialized subject focus',
    streams: [
      { id: 'P4-CUBS', name: 'CUBS', class_id: 'P4', studentCount: 29 },
      { id: 'P4-EAGLETS', name: 'EAGLETS', class_id: 'P4', studentCount: 27 },
      { id: 'P4-SPARKLES', name: 'SPARKLES', class_id: 'P4', studentCount: 25 },
      { id: 'P4-BUNNIES', name: 'BUNNIES', class_id: 'P4', studentCount: 31 }
    ]
  },
  {
    id: 'P5',
    name: 'Primary 5',
    description: 'Upper primary with exam preparation and critical thinking',
    streams: [
      { id: 'P5-SKYHIGH', name: 'SKY-HIGH', class_id: 'P5', studentCount: 22 },
      { id: 'P5-SUNSET', name: 'SUNSET', class_id: 'P5', studentCount: 24 },
      { id: 'P5-SUNRISE', name: 'SUNRISE', class_id: 'P5', studentCount: 26 }
    ]
  },
  {
    id: 'P6',
    name: 'Primary 6',
    description: 'Pre-secondary preparation with advanced curriculum',
    streams: [
      { id: 'P6-RADIANT', name: 'RADIANT', class_id: 'P6', studentCount: 23 },
      { id: 'P6-VIBRANT', name: 'VIBRANT', class_id: 'P6', studentCount: 25 },
      { id: 'P6-VICTORS', name: 'VICTORS', class_id: 'P6', studentCount: 27 }
    ]
  },
  {
    id: 'P7',
    name: 'Primary 7',
    description: 'Final primary year with comprehensive exam preparation',
    streams: [
      { id: 'P7-WINNERS', name: 'WINNERS', class_id: 'P7', studentCount: 21 },
      { id: 'P7-ACHIEVERS', name: 'ACHIEVERS', class_id: 'P7', studentCount: 23 },
      { id: 'P7-SUCCESS', name: 'SUCCESS', class_id: 'P7', studentCount: 25 }
    ]
  }
];

const getStreamColor = (streamName: string) => {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-red-500'
  ];
  const index = streamName.charCodeAt(0) % colors.length;
  return colors[index];
};

const ClassesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const { userName, photoUrl, userRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  const filteredClasses = mockClasses.filter(cls => {
    const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.streams.some(stream => stream.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = selectedClass === 'all' || cls.id === selectedClass;
    return matchesSearch && matchesFilter;
  });

  const totalStudents = mockClasses.reduce((acc, cls) => 
    acc + cls.streams.reduce((streamAcc, stream) => streamAcc + (stream.studentCount || 0), 0), 0
  );

  const totalStreams = mockClasses.reduce((acc, cls) => acc + cls.streams.length, 0);

  return (
    <DashboardLayout
      userRole={userRole}
      userName={userName || ''}
      photoUrl={photoUrl}
      onLogout={handleLogout}
    >
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Classes & Streams</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Manage your academic classes and student streams
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-slide-in-right">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockClasses.length}</div>
              <p className="text-xs text-muted-foreground">
                Primary 1 - Primary 7
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Streams</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStreams}</div>
              <p className="text-xs text-muted-foreground">
                Across all classes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                Enrolled students
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="animate-scale-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search classes, streams, or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {mockClasses.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {filteredClasses.map((classItem) => (
            <Card key={classItem.id} className="animate-fade-in hover-scale">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      {classItem.name}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {classItem.description}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">
                    {classItem.streams.length} streams
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Class Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-3 w-3" />
                      Total Students:
                    </span>
                    <span className="font-medium">
                      {classItem.streams.reduce((acc, stream) => acc + (stream.studentCount || 0), 0)}
                    </span>
                  </div>

                  {/* Streams */}
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      Streams
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {classItem.streams.map((stream) => (
                        <div
                          key={stream.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getStreamColor(stream.name)}`} />
                            <span className="font-medium text-sm">{stream.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {stream.studentCount} students
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1 flex-1 w-full sm:w-auto"
                      onClick={() => navigate(`/classes/${classItem.id}/details`)}
                    >
                      <Eye className="h-3 w-3" />
                      View Details
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1 flex-1 w-full sm:w-auto"
                      onClick={() => navigate(`/classes/${classItem.id}/attendance`)}
                    >
                      <UserCheck className="h-3 w-3" />
                      Attendance
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1 flex-1 w-full sm:w-auto"
                      onClick={() => navigate(`/classes/${classItem.id}/performance`)}
                    >
                      <Award className="h-3 w-3" />
                      Performance
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredClasses.length === 0 && (
          <Card className="animate-fade-in">
            <CardContent className="text-center py-8">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No classes found matching your search criteria</p>
              <Button variant="outline" className="mt-4" onClick={() => {
                setSearchTerm('');
                setSelectedClass('all');
              }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClassesPage;