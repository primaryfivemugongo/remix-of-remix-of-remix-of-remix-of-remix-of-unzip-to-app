import { useEffect, useState } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, Clock, Edit, FileText, XCircle } from "lucide-react";
import { useNavigate } from "@/lib/router-compat";
import { toast } from "@/hooks/use-toast";
import { ApplicationPreview } from "@/components/electoral";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

interface Application {
  id: string;
  student_name: string;
  student_email: string;
  student_photo?: string | null;
  position: string;
  class_name: string;
  stream_name: string;
  experience?: string;
  qualifications?: string;
  why_apply?: string;
  status: 'pending' | 'confirmed' | 'rejected';
  submitted_at: string;
  created_at?: string;
}

export default function ApplicationStatus() {
  const { user, userName, userRole, photoUrl, signOut } = useAuth();
  const navigate = useNavigate();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully."
      });
      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [user]);

  const fetchApplication = async () => {
    if (!user?.id && !userName) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('electoral_applications')
        .select('*')
        .eq('student_id', user?.id || userName)
        .single();
      
      if (data && !error) {
        setApplication({
          ...data,
          status: (data.status || 'pending') as 'pending' | 'confirmed' | 'rejected',
          submitted_at: data.created_at || data.submitted_at
        });
      }
    } catch (error) {
      console.error('Error fetching application:', error);
      toast({
        title: "Error",
        description: "Failed to load application status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleEditApplication = () => {
    navigate('/electoral/apply');
  };

  if (loading) {
    return (
      <DashboardLayout userRole={userRole || "student"} userName={userName} photoUrl={photoUrl} onLogout={handleLogout}>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">Loading your application status...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!application) {
    return (
      <DashboardLayout userRole={userRole || "student"} userName={userName} photoUrl={photoUrl} onLogout={handleLogout}>
        <div className="space-y-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/student/electoral')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Electoral Hub
          </Button>
          
          <Card className="text-center p-8">
            <CardContent>
              <h2 className="text-2xl font-bold mb-4">No Application Found</h2>
              <p className="text-muted-foreground mb-6">
                You haven't submitted an application yet.
              </p>
              <Button onClick={() => navigate('/electoral/apply')}>
                Submit Application
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={userRole || "student"} userName={userName} photoUrl={photoUrl} onLogout={handleLogout}>
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/student/electoral')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Electoral Hub
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Application Status</span>
              <Badge className={getStatusColor(application.status || 'pending')}>
                {getStatusIcon(application.status || 'pending')}
                <span className="ml-2 capitalize">{(application.status || 'pending')}</span>
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Candidate Name
                </label>
                <p className="font-medium">{application.student_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Position Applied For
                </label>
                <p className="font-medium">{application.position}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Class
                </label>
                <p className="font-medium">{application.class_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Stream
                </label>
                <p className="font-medium">{application.stream_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Submitted On
                </label>
                <p className="font-medium">
                  {new Date(application.created_at || application.submitted_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                {showPreview ? 'Hide' : 'View'} Application
              </Button>
            </div>

            {application.status === 'pending' && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">
                      Application Under Review
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Your application is currently being reviewed by the P.5 Orange Electoral Commission. 
                      You can still make changes to your application until it's confirmed.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={handleEditApplication}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Application
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {application.status === 'confirmed' && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-green-900 dark:text-green-100">
                      Application Confirmed
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Congratulations! Your application has been confirmed. 
                      No further changes can be made at this time.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {application.status === 'rejected' && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-red-900 dark:text-red-100">
                      Application Not Approved
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      Your application was not approved for this electoral period. 
                      Please contact the Electoral Commission for more information.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {showPreview && application && (
          <div className="mt-8">
            <ApplicationPreview 
              application={application}
              showActions={true}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}