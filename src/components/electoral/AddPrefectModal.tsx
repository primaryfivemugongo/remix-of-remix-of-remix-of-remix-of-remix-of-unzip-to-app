import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Check, Search } from "lucide-react";

interface AddPrefectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const allPositions = [
  {
    value: "head_prefect",
    label: "Head Prefect",
    eligibleClasses: ["P5", "P6"]
  },
  {
    value: "academic_prefect",
    label: "Academic Prefect", 
    eligibleClasses: ["P5", "P6"]
  },
  {
    value: "head_monitors",
    label: "Head Monitor(es)",
    eligibleClasses: ["P3", "P4"]
  },
  {
    value: "welfare_prefect",
    label: "Welfare Prefect (Mess Prefect)",
    eligibleClasses: ["P4", "P5"]
  },
  {
    value: "entertainment_prefect",
    label: "Entertainment Prefect",
    eligibleClasses: ["P3", "P4", "P5"]
  },
  {
    value: "games_sports_prefect",
    label: "Games and Sports Prefect",
    eligibleClasses: ["P4", "P5"]
  },
  {
    value: "health_sanitation",
    label: "Health & Sanitation",
    eligibleClasses: ["P3", "P4", "P5"]
  },
  {
    value: "uniform_uniformity",
    label: "Uniform & Uniformity",
    eligibleClasses: ["P2", "P3", "P4"]
  },
  {
    value: "time_keeper",
    label: "Time Keeper",
    eligibleClasses: ["P4", "P5"]
  },
  {
    value: "ict_prefect",
    label: "ICT Prefect",
    eligibleClasses: ["P3", "P4"]
  },
  {
    value: "furniture_prefect",
    label: "Furniture Prefect(s)",
    eligibleClasses: ["P3", "P4", "P5"]
  },
  {
    value: "prefect_upper_section",
    label: "Prefect for Upper Section",
    eligibleClasses: ["P5"]
  },
  {
    value: "prefect_lower_section",
    label: "Prefect for Lower Section",
    eligibleClasses: ["P2"]
  },
  {
    value: "discipline_prefect",
    label: "Prefect in Charge of Discipline",
    eligibleClasses: ["P3", "P4", "P5"]
  }
];

export default function AddPrefectModal({ open, onOpenChange, onSuccess }: AddPrefectModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [streams, setStreams] = useState<{ id: string; name: string; class_id?: string }[]>([]);
  const [positions, setPositions] = useState<{ id: string; title: string; eligibleClasses: string[] }[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    student_id: "",
    student_name: "",
    student_email: "",
    student_photo: "",
    position: "",
    class_name: "",
    stream_name: "",
    sex: "",
    age: "",
    class_teacher_name: "",
    class_teacher_tel: "",
    parent_name: "",
    parent_tel: "",
    status: "pending"
  });

  useEffect(() => {
    if (open) {
      fetchInitialData();
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce search and fetch students from database
  useEffect(() => {
    if (!searchQuery.trim()) {
      setStudents([]);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      searchStudentsInDatabase(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchInitialData = async () => {
    try {
      // Fetch classes, streams, and positions (no students upfront)
      const [
        { data: classesData, error: classesError },
        { data: streamsData, error: streamsError },
        { data: positionsData, error: positionsError }
      ] = await Promise.all([
        supabase.from('classes').select('id, name'),
        supabase.from('streams').select('id, name'),
        supabase.from('electoral_rows').select('id, title').eq('is_active', true)
      ]);

      if (classesError) throw classesError;
      if (streamsError) throw streamsError;
      if (positionsError) throw positionsError;

      setClasses(classesData || []);
      setStreams(streamsData || []);
      
      // Map positions - use exact title matching or fallback to predefined positions
      const mappedPositions = allPositions.map(pos => {
        const dbPosition = positionsData?.find(p => 
          p.title === pos.label || 
          p.title?.toLowerCase() === pos.label.toLowerCase()
        );
        return {
          id: dbPosition?.id || pos.value,
          title: pos.label,
          eligibleClasses: pos.eligibleClasses
        };
      });
      
      setPositions(mappedPositions);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch form data.",
        variant: "destructive"
      });
    }
  };

  const searchStudentsInDatabase = async (query: string) => {
    try {
      // Search database directly using Supabase query (like StudentsList does)
      const { data, error } = await supabase
        .from('students')
        .select('id, name, email, class_id, stream_id')
        .or(`name.ilike.%${query}%,email.ilike.%${query}%,id.ilike.%${query}%`)
        .order('name')
        .limit(50); // Limit to 50 results for performance

      if (error) throw error;
      
      setStudents(data || []);
    } catch (error) {
      console.error('Error searching students:', error);
      setStudents([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleStudentSelect = async (studentId: string, studentName: string) => {
    setSelectedStudent(studentId);
    setSearchQuery(studentName);
    setShowResults(false);
    const student = students.find(s => s.id === studentId);
    
    if (student) {
      const studentClass = classes.find(c => c.id === student.class_id);
      const studentStream = streams.find(s => s.id === student.stream_id);
      
      // Fetch full student data including photo
      const { data: fullStudentData } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();
      
      setFormData({
        ...formData,
        student_id: student.id,
        student_name: student.name,
        student_email: student.email,
        student_photo: fullStudentData?.photo_url || "",
        class_name: studentClass?.name || "",
        stream_name: studentStream?.name || "",
      });
    }
  };

  const filteredStudents = students;

  // Check if a student is eligible (P2-P6 only, not P1 or P7)
  const getIneligibilityReason = (student: any): string | null => {
    const studentClass = classes.find(c => c.id === student.class_id);
    
    if (!studentClass) {
      return "Class information not found";
    }
    
    if (studentClass.name === 'P1') {
      return "P1 students are not eligible to apply for prefect positions";
    }
    
    if (studentClass.name === 'P7') {
      return "P7 students are not eligible to apply for prefect positions";
    }
    
    return null;
  };

  // Get available positions based on selected student's class
  const getAvailablePositions = () => {
    if (!formData.class_name) return [];
    
    return positions.filter(position => 
      position.eligibleClasses.includes(formData.class_name)
    );
  };

  const availablePositions = getAvailablePositions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate a unique ID for the application
      const applicationId = crypto.randomUUID();
      
      // Create application data object
      const applicationData = {
        id: applicationId,
        student_id: formData.student_id,
        student_name: formData.student_name,
        student_email: formData.student_email,
        student_photo: formData.student_photo || null,
        position: formData.position,
        class_name: formData.class_name,
        stream_name: formData.stream_name,
        sex: formData.sex || null,
        age: formData.age ? parseInt(formData.age) : null,
        class_teacher_name: formData.class_teacher_name || null,
        class_teacher_tel: formData.class_teacher_tel || null,
        parent_name: formData.parent_name || null,
        parent_tel: formData.parent_tel || null,
        status: formData.status as 'pending' | 'confirmed' | 'rejected'
      };

      // Insert into database
      const { error } = await supabase
        .from('electoral_applications')
        .insert([applicationData]);
      
      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Prefect application added successfully to database."
      });

      // Reset form
      setFormData({
        student_id: "",
        student_name: "",
        student_email: "",
        student_photo: "",
        position: "",
        class_name: "",
        stream_name: "",
        sex: "",
        age: "",
        class_teacher_name: "",
        class_teacher_tel: "",
        parent_name: "",
        parent_tel: "",
        status: "pending"
      });
      setSelectedStudent("");

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error adding application:', error);
      
      let errorMessage = "Failed to add prefect application.";
      if (error?.message) {
        errorMessage += ` ${error.message}`;
      }
      if (error?.code === 'PGRST301') {
        errorMessage = "Permission denied. Please check database RLS policies for electoral_applications table.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Prefect Application</DialogTitle>
          <DialogDescription>
            Manually add a student's prefect application. This will blend with applications submitted by students.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            {/* Search Student */}
            <div className="space-y-2" ref={searchRef}>
              <Label htmlFor="search_student">Search Student *</Label>
              <div className="relative">
                <Input
                  id="search_student"
                  type="text"
                  placeholder="Type student name or email..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedStudent("");
                    setShowResults(true);
                  }}
                  onFocus={() => setShowResults(true)}
                  className="pr-10"
                  autoComplete="off"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              
              {/* Results dropdown */}
              {searchQuery && showResults && (
                <div className="relative">
                  <div className="absolute w-full bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto z-50">
                    {isSearching ? (
                      <div className="px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Searching students...
                      </div>
                    ) : filteredStudents.length > 0 ? (
                      <div className="py-1">
                        {filteredStudents.map((student) => {
                          const studentClass = classes.find(c => c.id === student.class_id);
                          const studentStream = streams.find(s => s.id === student.stream_id);
                          const ineligibilityReason = getIneligibilityReason(student);
                          
                          return (
                            <button
                              key={student.id}
                              type="button"
                              onClick={() => handleStudentSelect(student.id, student.name)}
                              className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-start gap-2 border-b last:border-b-0"
                              disabled={!!ineligibilityReason}
                            >
                              {selectedStudent === student.id && (
                                <Check className="h-4 w-4 mt-1 text-primary flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm">{student.name}</div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {student.email} • {studentClass?.name || 'No class'} {studentStream?.name || ''}
                                </div>
                                {ineligibilityReason && (
                                  <div className="text-xs text-red-500 italic mt-1">
                                    {ineligibilityReason}
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="px-4 py-3 text-sm text-muted-foreground">
                        {searchQuery.trim().length < 2 
                          ? "Type at least 2 characters to search..." 
                          : "No student found. Try a different search term."}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dynamic Fields - Auto-populated */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student_name">Student Name *</Label>
                <Input
                  id="student_name"
                  required
                  value={formData.student_name}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="student_email">Student Email *</Label>
                <Input
                  id="student_email"
                  type="email"
                  required
                  value={formData.student_email}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="class_name">Class *</Label>
                <Input
                  id="class_name"
                  required
                  value={formData.class_name}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stream_name">Stream *</Label>
                <Input
                  id="stream_name"
                  required
                  value={formData.stream_name}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            {/* Position and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Position *</Label>
                <Select 
                  value={formData.position} 
                  onValueChange={(value) => setFormData({ ...formData, position: value })}
                  disabled={!formData.class_name}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder={formData.class_name ? "Select position" : "Select student first"} />
                  </SelectTrigger>
                  <SelectContent className="bg-background border z-50">
                    {availablePositions.length > 0 ? (
                      availablePositions.map((pos) => (
                        <SelectItem key={pos.id} value={pos.id}>
                          {pos.title}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        No positions available for this class
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border z-50">
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Manual Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sex">Sex</Label>
                <Select value={formData.sex} onValueChange={(value) => setFormData({ ...formData, sex: value })}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select sex" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border z-50">
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="e.g., 13"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="class_teacher_name">Class Teacher Name</Label>
                <Input
                  id="class_teacher_name"
                  value={formData.class_teacher_name}
                  onChange={(e) => setFormData({ ...formData, class_teacher_name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="class_teacher_tel">Class Teacher Tel</Label>
                <Input
                  id="class_teacher_tel"
                  value={formData.class_teacher_tel}
                  onChange={(e) => setFormData({ ...formData, class_teacher_tel: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parent_name">Parent Name</Label>
                <Input
                  id="parent_name"
                  value={formData.parent_name}
                  onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parent_tel">Parent Tel</Label>
                <Input
                  id="parent_tel"
                  value={formData.parent_tel}
                  onChange={(e) => setFormData({ ...formData, parent_tel: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Application
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
