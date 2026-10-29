import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  UserPlus, 
  Trophy, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  User,
  GraduationCap,
  Eye,
  RefreshCw,
  FileText
} from "lucide-react";
import { useNavigate } from "@/lib/router-compat";
import { useToast } from "@/hooks/use-toast";
import { Confetti } from "@/components/ui/confetti";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import ApplicationPreview from "@/components/electoral/ApplicationPreview";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// Available positions
const allPositions = [
  {
    value: "head_prefect",
    label: "Head Prefect",
    description: "Lead the entire student body and represent students to school administration",
    eligibleClasses: ["P5", "P6"]
  },
  {
    value: "academic_prefect",
    label: "Academic Prefect", 
    description: "Oversee academic activities and support student learning initiatives",
    eligibleClasses: ["P5", "P6"]
  },
  {
    value: "head_monitors",
    label: "Head Monitor(es)",
    description: "Coordinate monitor activities and maintain school discipline",
    eligibleClasses: ["P3", "P4"]
  },
  {
    value: "welfare_prefect",
    label: "Welfare Prefect (Mess Prefect)",
    description: "Manage student welfare and dining hall operations",
    eligibleClasses: ["P4", "P5"]
  },
  {
    value: "entertainment_prefect",
    label: "Entertainment Prefect",
    description: "Organize school events and entertainment activities", 
    eligibleClasses: ["P3", "P4", "P5"]
  },
  {
    value: "games_sports_prefect",
    label: "Games and Sports Prefect",
    description: "Coordinate sports activities and represent the school in competitions",
    eligibleClasses: ["P4", "P5"]
  },
  {
    value: "health_sanitation",
    label: "Health & Sanitation",
    description: "Maintain school hygiene and promote health awareness",
    eligibleClasses: ["P3", "P4", "P5"]
  },
  {
    value: "uniform_uniformity",
    label: "Uniform & Uniformity",
    description: "Ensure proper school uniform standards and dress code compliance",
    eligibleClasses: ["P2", "P3", "P4"]
  },
  {
    value: "time_keeper",
    label: "Time Keeper",
    description: "Manage school schedules and ensure punctuality",
    eligibleClasses: ["P4", "P5"]
  },
  {
    value: "ict_prefect",
    label: "ICT Prefect",
    description: "Support technology use and digital learning initiatives",
    eligibleClasses: ["P3", "P4"]
  },
  {
    value: "furniture_prefect",
    label: "Furniture Prefect(s)",
    description: "Maintain and oversee school furniture and property",
    eligibleClasses: ["P3", "P4", "P5"]
  },
  {
    value: "prefect_upper_section",
    label: "Prefect for Upper Section",
    description: "Oversee and coordinate activities for upper section students",
    eligibleClasses: ["P5"]
  },
  {
    value: "prefect_lower_section",
    label: "Prefect for Lower Section",
    description: "Oversee and coordinate activities for lower section students",
    eligibleClasses: ["P2"]
  },
  {
    value: "discipline_prefect",
    label: "Prefect in Charge of Discipline",
    description: "Maintain school discipline and enforce school rules",
    eligibleClasses: ["P3", "P4", "P5"]
  }
];

interface StudentDetails {
  id: string;
  name: string;
  email: string;
  photo_url: string | null;
  class_name: string;
  stream_name: string;
}

interface ApplicationForm {
  position: string;
  sex: string;
  age: string;
  class_teacher_name: string;
  class_teacher_tel: string;
  parent_name: string;
  parent_tel: string;
  experience: string;
  qualifications: string;
  whyApply: string;
}

export default function Apply() {
  const navigate = useNavigate();
  const { user, userName, userRole, photoUrl } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [consentChecked, setConsentChecked] = useState(false);
  const [showConsentError, setShowConsentError] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [studentDetails, setStudentDetails] = useState<StudentDetails | null>(null);
  const [loadingStudent, setLoadingStudent] = useState(true);
  const [detailsConfirmed, setDetailsConfirmed] = useState(false);
  const [submittedApplication, setSubmittedApplication] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  const handleLogout = () => {
    navigate('/login');
  };
  
  // Load form data from localStorage on mount
  const [formData, setFormData] = useState<ApplicationForm>(() => {
    const saved = localStorage.getItem('electoralApplicationForm');
    return saved ? JSON.parse(saved) : {
      position: "",
      sex: "",
      age: "",
      class_teacher_name: "",
      class_teacher_tel: "",
      parent_name: "",
      parent_tel: "",
      experience: "",
      qualifications: "",
      whyApply: "",
    };
  });

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('electoralApplicationForm', JSON.stringify(formData));
  }, [formData]);

  // Check for existing application and fetch student details
  useEffect(() => {
    const fetchStudentDetailsAndCheckApplication = async () => {
      if (!user?.id) {
        setLoadingStudent(false);
        return;
      }

      try {
        // First check if student already has an application
        const { data: existingApplication } = await supabase
          .from('electoral_applications')
          .select('id, status')
          .eq('student_id', user.id)
          .single();

        console.log('Existing application check:', existingApplication);

        if (existingApplication) {
          // Only redirect if application is confirmed or rejected
          // Allow editing if application is pending or null/undefined
          const status = existingApplication.status || 'pending';
          console.log('Application status:', status);
          
          if (status === 'confirmed' || status === 'rejected') {
            toast({
              title: "Application Already Processed",
              description: `Your application has been ${status}. You cannot make changes to a processed application.`,
            });
            navigate('/electoral/status');
            return;
          }
          // If status is pending, allow editing by continuing to load the form
        }

        // Fetch student details with class and stream information
        const { data: student, error } = await supabase
          .from('students')
          .select(`
            id,
            name,
            email,
            photo_url,
            class_id,
            stream_id
          `)
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (student) {
          // Fetch class and stream names separately
          const [classData, streamData] = await Promise.all([
            supabase.from('classes').select('name').eq('id', student.class_id).single(),
            supabase.from('streams').select('name').eq('id', student.stream_id).single()
          ]);

          setStudentDetails({
            id: student.id,
            name: student.name,
            email: student.email,
            photo_url: student.photo_url,
            class_name: classData.data?.name || 'Unknown Class',
            stream_name: streamData.data?.name || 'Unknown Stream'
          });
        }
      } catch (error) {
        console.error('Error fetching student details:', error);
        toast({
          title: "Error",
          description: "Failed to load your student details. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoadingStudent(false);
      }
    };

    fetchStudentDetailsAndCheckApplication();
  }, [user?.id, toast, navigate]);


  // Get available positions based on student's class
  const getAvailablePositions = () => {
    if (!studentDetails?.class_name) return [];
    
    return allPositions.filter(position => 
      position.eligibleClasses.includes(studentDetails.class_name)
    );
  };

  const positions = getAvailablePositions();

  const handleInputChange = (field: keyof ApplicationForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!consentChecked) {
      setShowConsentError(true);
      toast({
        title: "Consent Required",
        description: "Please confirm that all information provided is accurate before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Check if this is an edit (existing application) or new submission
      const { data: existingApplication } = await supabase
        .from('electoral_applications')
        .select('id, status')
        .eq('student_id', studentDetails?.id)
        .single();

      // If application exists and is not pending, prevent submission
      if (existingApplication && (existingApplication.status === 'confirmed' || existingApplication.status === 'rejected')) {
        toast({
          title: "Cannot Edit Application",
          description: "Your application has already been processed and cannot be modified.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        navigate('/electoral/status');
        return;
      }

      // Show confetti first
      setShowConfetti(true);
      
      // Store application data (now including all form fields)
      const applicationData = {
        student_id: studentDetails?.id,
        student_name: studentDetails?.name,
        student_email: studentDetails?.email,
        student_photo: studentDetails?.photo_url,
        position: formData.position,
        class_name: studentDetails?.class_name,
        stream_name: studentDetails?.stream_name,
        sex: formData.sex,
        age: parseInt(formData.age) || 0,
        class_teacher_name: formData.class_teacher_name,
        class_teacher_tel: formData.class_teacher_tel,
        parent_name: formData.parent_name,
        parent_tel: formData.parent_tel || '',
        experience: formData.experience,
        qualifications: formData.qualifications,
        why_apply: formData.whyApply,
        submitted_at: new Date().toISOString(),
        status: 'pending' // Ensure status is set to pending
      };

      let savedApplication;

      if (existingApplication) {
        // Update existing application
        const { data, error } = await supabase
          .from('electoral_applications')
          .update(applicationData as any)
          .eq('id', existingApplication.id)
          .select()
          .single();
        
        if (error) throw error;
        savedApplication = data;
      } else {
        // Insert new application
        const { data, error } = await supabase
          .from('electoral_applications')
          .insert([{ ...applicationData, id: crypto.randomUUID() }])
          .select()
          .single();
        
        if (error) throw error;
        savedApplication = data;
      }
      
      toast({
        title: existingApplication ? "🎉 Application Updated!" : "🎉 Application Submitted!",
        description: `Congratulations, ${studentDetails?.name}! You have successfully ${existingApplication ? 'updated' : 'applied for'} the post of ${positions.find(p => p.value === formData.position)?.label}. Your application is under review by the P.5 Orange Electoral Commission.`,
      });
      
      // Clear localStorage after successful submission
      localStorage.removeItem('electoralApplicationForm');
      
      // Set submitted application data for preview
      setSubmittedApplication(savedApplication);
      setShowPreview(true);
      
      // Scroll to top when showing preview
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
      setCurrentStep(4); // Move to preview step
      
      // Hide confetti after animation
      setTimeout(() => {
        setShowConfetti(false);
        setIsSubmitting(false);
      }, 4000);
      
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      // Use setTimeout to ensure the step change is rendered before scrolling
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Use setTimeout to ensure the step change is rendered before scrolling
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return detailsConfirmed && 
               studentDetails && 
               formData.sex && 
               formData.age && 
               formData.class_teacher_name && 
               formData.class_teacher_tel && 
               formData.parent_name && 
               formData.parent_tel;
      case 2:
        return formData.position;
      case 3:
        return true; // Preview step
      default:
        return false;
    }
  };

  // Check if student is eligible to apply (P2-P6 only)
  const isEligibleToApply = studentDetails && !['P1', 'P7'].includes(studentDetails.class_name);

  return (
    <DashboardLayout 
      userRole={userRole} 
      userName={userName || ''} 
      photoUrl={photoUrl} 
      onLogout={handleLogout}
    >
      <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Confetti isActive={showConfetti} onComplete={() => setShowConfetti(false)} />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/student/electoral')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Electoral Hub
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <UserPlus className="h-8 w-8" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Apply for Leadership
              </h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Step forward and make a difference in your school community
            </p>
          </div>

          {/* Progress Indicator */}
          {currentStep <= 3 && (
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-4">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= step 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {currentStep > step ? <CheckCircle className="h-4 w-4" /> : step}
                    </div>
                    {step < 3 && (
                      <div className={`w-12 h-0.5 ${
                        currentStep > step ? 'bg-primary' : 'bg-muted'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Application Preview Step */}
          {currentStep === 4 && showPreview && submittedApplication ? (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white">
                    <FileText className="h-8 w-8" />
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                    Application Submitted Successfully!
                  </h2>
                </div>
                <p className="text-lg text-muted-foreground">
                  Your application has been submitted to the P.5 Orange Electoral Commission
                </p>
              </div>

              <ApplicationPreview 
                application={submittedApplication}
                onClose={() => navigate('/electoral')}
              />
            </div>
          ) : (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  {currentStep === 1 && (
                    <>
                      <GraduationCap className="h-5 w-5 text-blue-500" />
                      Student Identification
                    </>
                  )}
                  {currentStep === 2 && (
                    <>
                      <Trophy className="h-5 w-5 text-orange-500" />
                      Position Selection
                    </>
                  )}
                  {currentStep === 3 && (
                    <>
                      <Eye className="h-5 w-5 text-purple-500" />
                      Review & Submit
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1: Confirm Student Details */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="text-center space-y-2 mb-6">
                      <h3 className="text-lg font-semibold">Confirm Your Details</h3>
                      <p className="text-muted-foreground">
                        Please verify that your information below is correct before proceeding
                      </p>
                    </div>

                    {loadingStudent ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin text-primary mr-2" />
                        <span>Loading your details...</span>
                      </div>
                    ) : !studentDetails ? (
                      <div className="text-center py-8">
                        <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
                        <h4 className="font-medium text-lg mb-2">Student Record Not Found</h4>
                        <p className="text-muted-foreground mb-4">
                          We couldn't find your student record in our database. Please contact the school administration.
                        </p>
                        <Button variant="outline" onClick={() => navigate('/student/electoral')}>
                          Back to Electoral Hub
                        </Button>
                      </div>
                    ) : !isEligibleToApply ? (
                      <div className="text-center py-8">
                        <AlertCircle className="h-12 w-12 mx-auto text-orange-500 mb-4" />
                        <h4 className="font-medium text-lg mb-2">Not Eligible to Apply</h4>
                        <p className="text-muted-foreground mb-4">
                          Students in {studentDetails?.class_name} are not eligible to participate in the electoral contest. 
                          Only students in classes P2 through P6 can apply for prefectorial positions.
                        </p>
                        <Button variant="outline" onClick={() => navigate('/student/electoral')}>
                          Back to Electoral Hub
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Student Details Card - Display Only */}
                        <Card className="border-2 border-blue-200 dark:border-blue-800">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                              <User className="h-5 w-5 text-blue-500" />
                              Your Student Information
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0">
                                <img
                                  src={studentDetails.photo_url || "/src/assets/default-avatar.png"}
                                  alt={`${studentDetails.name}'s photo`}
                                  className="w-20 h-20 rounded-lg object-cover border-2 border-blue-300 dark:border-blue-600"
                                  onError={(e) => {
                                    e.currentTarget.src = "/src/assets/default-avatar.png";
                                  }}
                                />
                              </div>
                              <div className="flex-1 grid md:grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-muted-foreground text-sm">Full Name</Label>
                                  <p className="font-medium text-lg">{studentDetails.name}</p>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground text-sm">Email Address</Label>
                                  <p className="font-medium">{studentDetails.email}</p>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground text-sm">Class</Label>
                                  <p className="font-medium">{studentDetails.class_name}</p>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground text-sm">Stream</Label>
                                  <p className="font-medium">{studentDetails.stream_name}</p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Additional Information Form */}
                        <Card className="border-2 border-green-200 dark:border-green-800">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                              <User className="h-5 w-5 text-green-500" />
                              Additional Information Required
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="sex">Sex *</Label>
                                <Select value={formData.sex} onValueChange={(value) => handleInputChange('sex', value)}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select sex" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="age">Age *</Label>
                                <Input
                                  id="age"
                                  type="number"
                                  min="5"
                                  max="18"
                                  value={formData.age}
                                  onChange={(e) => handleInputChange('age', e.target.value)}
                                  placeholder="Enter your age"
                                />
                              </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="class_teacher_name">Class Teacher's Name *</Label>
                                <Input
                                  id="class_teacher_name"
                                  value={formData.class_teacher_name}
                                  onChange={(e) => handleInputChange('class_teacher_name', e.target.value)}
                                  placeholder="Enter class teacher's full name"
                                />
                              </div>
                              <div>
                                <Label htmlFor="class_teacher_tel">Class Teacher's Telephone *</Label>
                                <Input
                                  id="class_teacher_tel"
                                  type="tel"
                                  value={formData.class_teacher_tel}
                                  onChange={(e) => handleInputChange('class_teacher_tel', e.target.value)}
                                  placeholder="Enter class teacher's phone number"
                                />
                              </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="parent_name">Parent/Guardian's Name *</Label>
                                <Input
                                  id="parent_name"
                                  value={formData.parent_name}
                                  onChange={(e) => handleInputChange('parent_name', e.target.value)}
                                  placeholder="Enter parent/guardian's full name"
                                />
                              </div>
                              <div>
                                <Label htmlFor="parent_tel">Parent/Guardian's Telephone *</Label>
                                <Input
                                  id="parent_tel"
                                  type="tel"
                                  value={formData.parent_tel}
                                  onChange={(e) => handleInputChange('parent_tel', e.target.value)}
                                  placeholder="Enter parent/guardian's phone number"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Confirmation */}
                        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div className="flex-1">
                              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-3">Confirm Details</h4>
                              <div className="flex items-start gap-3">
                                <Checkbox 
                                  id="confirm-details" 
                                  checked={detailsConfirmed}
                                  onCheckedChange={(checked) => setDetailsConfirmed(checked === true)}
                                  className="mt-0.5"
                                />
                                <label 
                                  htmlFor="confirm-details" 
                                  className="text-sm text-blue-700 dark:text-blue-300 cursor-pointer"
                                >
                                  I confirm that the above information is accurate and I am <strong>{studentDetails.name}</strong> from <strong>{studentDetails.class_name} {studentDetails.stream_name}</strong>.
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>

        {detailsConfirmed && formData.sex && formData.age && formData.class_teacher_name && formData.class_teacher_tel && formData.parent_name && formData.parent_tel && (
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800 dark:text-green-200">
                All Information Complete - Ready to Proceed
              </span>
            </div>
          </div>
        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Position Selection */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                     <div className="text-center space-y-2">
                       <h3 className="text-lg font-semibold">Choose Your Prefectorial Position</h3>
                       <p className="text-muted-foreground">
                         Select from the available prefectorial posts for your class level
                       </p>
                       {studentDetails && (
                         <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm">
                           <p className="text-blue-800 dark:text-blue-200">
                             <strong>Available positions for {studentDetails.class_name}:</strong> {positions.length} posts
                           </p>
                         </div>
                       )}
                     </div>
                    
                     {positions.length === 0 ? (
                       <div className="text-center py-8">
                         <AlertCircle className="h-12 w-12 mx-auto text-orange-500 mb-4" />
                         <h4 className="font-medium text-lg mb-2">No Positions Available</h4>
                         <p className="text-muted-foreground">
                           Unfortunately, there are no prefectorial positions available for your class level at this time.
                         </p>
                       </div>
                     ) : (
                       <div className="grid md:grid-cols-1 gap-4">
                         {positions.map((position) => (
                        <Card 
                          key={position.value}
                          className={`cursor-pointer transition-all hover:shadow-md border-2 ${
                            formData.position === position.value 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => handleInputChange('position', position.value)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{position.label}</h4>
                              {formData.position === position.value && (
                                <CheckCircle className="h-5 w-5 text-primary" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {position.description}
                            </p>
                          </CardContent>
                         </Card>
                         ))}
                       </div>
                     )}

                    {formData.position && (
                      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-green-800 dark:text-green-200">
                            Position Selected: {positions.find(p => p.value === formData.position)?.label}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Review & Submit */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="text-center space-y-2 mb-6">
                      <h3 className="text-lg font-semibold">Review Your Application</h3>
                      <p className="text-muted-foreground">
                        Please review all details before submitting your application
                      </p>
                    </div>

                    <div className="grid gap-6">
                      {/* Student Information */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Student Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-muted-foreground">Name</Label>
                            <p className="font-medium">{studentDetails?.name}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Email</Label>
                            <p className="font-medium">{studentDetails?.email}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Photo</Label>
                            <img
                              src={studentDetails?.photo_url || "/src/assets/default-avatar.png"}
                              alt={`${studentDetails?.name}'s photo`}
                              className="w-12 h-12 rounded-lg object-cover border border-border mt-1"
                              onError={(e) => {
                                e.currentTarget.src = "/src/assets/default-avatar.png";
                              }}
                            />
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Sex</Label>
                            <p className="font-medium">{formData.sex}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Age</Label>
                            <p className="font-medium">{formData.age}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Class Teacher</Label>
                            <p className="font-medium">{formData.class_teacher_name} - {formData.class_teacher_tel}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Parent/Guardian</Label>
                            <p className="font-medium">{formData.parent_name} - {formData.parent_tel}</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Position Information */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Trophy className="h-5 w-5" />
                            Applied Position
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div>
                            <Label className="text-muted-foreground">Position</Label>
                            <p className="font-medium">{positions.find(p => p.value === formData.position)?.label}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {positions.find(p => p.value === formData.position)?.description}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Consent Confirmation */}
                      <div className={`bg-blue-50 dark:bg-blue-950/20 border rounded-lg p-4 transition-all duration-300 ${
                        showConsentError 
                          ? 'border-red-500 shadow-lg shadow-red-500/25 animate-pulse' 
                          : 'border-blue-200 dark:border-blue-800'
                      }`}>
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-3">Application Confirmation</h4>
                            <div className="flex items-start gap-3">
                              <Checkbox 
                                id="consent" 
                                checked={consentChecked}
                                onCheckedChange={(checked) => {
                                  setConsentChecked(checked === true);
                                  if (checked === true) setShowConsentError(false);
                                }}
                                className="mt-0.5"
                              />
                              <label 
                                htmlFor="consent" 
                                className="text-sm text-blue-700 dark:text-blue-300 cursor-pointer"
                              >
                                I, <strong>{studentDetails?.name || 'the applicant'}</strong>, confirm that all information provided is accurate and complete. I understand that any false information may result in disqualification from the election process.
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-4 pt-6">
                  {currentStep > 1 && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={prevStep}
                      className="flex-1"
                    >
                      Previous
                    </Button>
                  )}
                  {currentStep < 3 ? (
                    <Button 
                      type="button" 
                      onClick={nextStep}
                      disabled={!isStepValid(currentStep)}
                      className={currentStep === 1 ? "w-full" : "flex-1"}
                    >
                      Next Step
                    </Button>
                  ) : (
                    <Button 
                      type="button" 
                      onClick={handleSubmit}
                      disabled={isSubmitting || !formData.position || !consentChecked}
                      className="flex-1"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Application"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Important Notes */}
          {currentStep <= 3 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  Important Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                   <div>
                     <h4 className="font-medium mb-2">Application Deadline</h4>
                     <p className="text-muted-foreground">All applications must be submitted by September 19, 2025 at 4:00 PM EAT</p>
                   </div>
                   <div>
                     <h4 className="font-medium mb-2">Vetting Process</h4>
                     <p className="text-muted-foreground">Nominees will be vetted from September 25-27, 2025</p>
                   </div>
                   <div>
                     <h4 className="font-medium mb-2">Campaign Period</h4>
                     <p className="text-muted-foreground">Approved candidates may campaign from October 1-16, 2025</p>
                   </div>
                   <div>
                     <h4 className="font-medium mb-2">Class Eligibility</h4>
                     <p className="text-muted-foreground">Each position has specific class requirements - check eligibility before applying</p>
                   </div>
                </div>
              </CardContent>
              </Card>
          )}
        </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}