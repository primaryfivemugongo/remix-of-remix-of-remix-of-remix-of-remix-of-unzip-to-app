import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Mail, Phone, Calendar, MapPin, AlertTriangle, CheckCircle, BookOpen, GraduationCap, Building, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface PersonalInfoProps {
  userName: string;
  userRole: string | null;
  userEmail: string | undefined;
  personalEmail: string | null;
}

interface StudentData {
  class_name?: string;
  stream_name?: string;
}

interface TeacherData {
  sex?: string;
  nationality?: string;
  subjectsTaught?: string;
  classesTaught?: string;
  contactNumber?: string;
}

interface AdminData {
  department?: string;
  role_description?: string;
}

interface UserVerificationData {
  is_verified?: boolean;
  personal_email?: string;
}

export function PersonalInfo({ userName, userRole, userEmail, personalEmail }: PersonalInfoProps) {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState<StudentData>({});
  const [teacherData, setTeacherData] = useState<TeacherData>({});
  const [adminData, setAdminData] = useState<AdminData>({});
  const [verificationData, setVerificationData] = useState<UserVerificationData>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userRole === 'student' && userEmail) {
      fetchStudentClassAndStream();
    }
    if (userRole === 'teacher' && userEmail) {
      fetchTeacherData();
    }
    if (userRole === 'admin' && userEmail) {
      fetchAdminData();
    }
    if (userEmail) {
      fetchVerificationData();
    }
  }, [userRole, userEmail]);

  const fetchVerificationData = async () => {
    if (!userEmail) return;
    
    try {
      let verificationResult = null;
      
      if (userRole === 'student') {
        verificationResult = await supabase
          .from('students')
          .select('is_verified, personal_email')
          .eq('email', userEmail)
          .maybeSingle();
      } else if (userRole === 'teacher') {
        verificationResult = await supabase
          .from('teachers')
          .select('is_verified, personal_email')
          .eq('email', userEmail)
          .maybeSingle();
      } else if (userRole === 'admin') {
        verificationResult = await supabase
          .from('admins')
          .select('is_verified, personal_email')
          .eq('email', userEmail)
          .maybeSingle();
      }
      
      if (verificationResult?.data) {
        setVerificationData({
          is_verified: verificationResult.data.is_verified,
          personal_email: verificationResult.data.personal_email
        });
      }
    } catch (error) {
      console.error('Error fetching verification data:', error);
    }
  };

  const fetchStudentClassAndStream = async () => {
    if (!userEmail) {
      console.log('No user email found');
      return;
    }
    
    console.log('Fetching student data for email:', userEmail);
    
    setIsLoading(true);
    try {
      // Get student data first
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('class_id, stream_id, name')
        .eq('email', userEmail)
        .maybeSingle();

      console.log('Student query result:', { student, error: studentError });

      if (studentError) {
        console.error('Error fetching student data:', studentError);
        return;
      }

      if (student) {
        // Now fetch class and stream names using the IDs
        const [classResult, streamResult] = await Promise.all([
          student.class_id ? supabase.from('classes').select('name').eq('id', student.class_id).maybeSingle() : Promise.resolve({ data: null }),
          student.stream_id ? supabase.from('streams').select('name').eq('id', student.stream_id).maybeSingle() : Promise.resolve({ data: null })
        ]);

        setStudentData({
          class_name: classResult.data?.name || 'Not assigned',
          stream_name: streamResult.data?.name || 'Not assigned'
        });
      } else {
        console.log('No student found with email:', userEmail);
        setStudentData({
          class_name: 'Not assigned',
          stream_name: 'Not assigned'
        });
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
      setStudentData({
        class_name: 'Not assigned',
        stream_name: 'Not assigned'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeacherData = async () => {
    if (!userEmail) {
      console.log('No user email found');
      return;
    }
    
    console.log('Fetching teacher data for email:', userEmail);
    
    setIsLoading(true);
    try {
      const { data: teacher, error: teacherError } = await supabase
        .from('teachers')
        .select('sex, nationality, subjectsTaught, classesTaught, contactNumber')
        .eq('email', userEmail)
        .maybeSingle();

      console.log('Teacher query result:', { teacher, error: teacherError });

      if (teacherError) {
        console.error('Error fetching teacher data:', teacherError);
        return;
      }

      if (teacher) {
        setTeacherData({
          sex: teacher.sex || 'Not specified',
          nationality: teacher.nationality || 'Not specified',
          subjectsTaught: teacher.subjectsTaught || 'Not assigned',
          classesTaught: teacher.classesTaught || 'Not assigned',
          contactNumber: teacher.contactNumber?.toString() || 'Not provided'
        });
      } else {
        console.log('No teacher found with email:', userEmail);
        setTeacherData({
          sex: 'Not specified',
          nationality: 'Not specified',
          subjectsTaught: 'Not assigned',
          classesTaught: 'Not assigned',
          contactNumber: 'Not provided'
        });
      }
    } catch (error) {
      console.error('Error fetching teacher data:', error);
      setTeacherData({
        sex: 'Not specified',
        nationality: 'Not specified',
        subjectsTaught: 'Not assigned',
        classesTaught: 'Not assigned',
        contactNumber: 'Not provided'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdminData = async () => {
    if (!userEmail) {
      console.log('No user email found');
      return;
    }
    
    console.log('Fetching admin data for email:', userEmail);
    
    setIsLoading(true);
    try {
      // For now, we'll just set basic admin data since the admin table might not have additional fields
      // This can be expanded later if the admin table gets more fields
      setAdminData({
        department: 'Administration',
        role_description: 'System Administrator'
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setAdminData({
        department: 'Administration',
        role_description: 'System Administrator'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Your account details are managed by the school administration and cannot be changed here.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              <User className="inline mr-2 h-4 w-4" />
              Full Name
            </Label>
            <Input id="name" value={userName} disabled />
          </div>
          
          {userRole === 'student' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="class">Class</Label>
                {isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Input id="class" value={studentData.class_name || 'Not assigned'} disabled />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="stream">Stream</Label>
                {isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Input id="stream" value={studentData.stream_name || 'Not assigned'} disabled />
                )}
              </div>
            </>
          )}

          {userRole === 'teacher' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="sex">Gender</Label>
                {isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Input id="sex" value={teacherData.sex || 'Not specified'} disabled />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality</Label>
                {isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Input id="nationality" value={teacherData.nationality || 'Not specified'} disabled />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="subjects">
                  <BookOpen className="inline mr-2 h-4 w-4" />
                  Subjects Taught
                </Label>
                {isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Input id="subjects" value={teacherData.subjectsTaught || 'Not assigned'} disabled />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="classes">
                  <GraduationCap className="inline mr-2 h-4 w-4" />
                  Classes Taught
                </Label>
                {isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Input id="classes" value={teacherData.classesTaught || 'Not assigned'} disabled />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">
                  <Phone className="inline mr-2 h-4 w-4" />
                  Contact Number
                </Label>
                {isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Input id="contact" value={teacherData.contactNumber || 'Not provided'} disabled />
                )}
              </div>
            </>
          )}

          {userRole === 'admin' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="department">
                  <Building className="inline mr-2 h-4 w-4" />
                  Department
                </Label>
                {isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Input id="department" value={adminData.department || 'Administration'} disabled />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">
                  <Shield className="inline mr-2 h-4 w-4" />
                  Role
                </Label>
                {isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Input id="role" value={adminData.role_description || 'System Administrator'} disabled />
                )}
              </div>
            </>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="schoolEmail">
              <Mail className="inline mr-2 h-4 w-4" />
              School Email
            </Label>
            <Input id="schoolEmail" value={userEmail || ""} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="personalEmailDisplay">
              <Mail className="inline mr-2 h-4 w-4" />
              Personal Email
            </Label>
            <Input 
              id="personalEmailDisplay" 
              value={verificationData.personal_email || personalEmail || "Not set"} 
              disabled 
              className={!(verificationData.personal_email || personalEmail) ? "text-muted-foreground" : ""}
            />
            
            {/* Verification Status - Only show if personal email is set */}
            {(verificationData.personal_email || personalEmail) && (
              <div className="mt-2">
                {verificationData.is_verified ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Verified</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-orange-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">Pending</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}