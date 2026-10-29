import { useEffect } from "react";
import { useNavigate } from "@/lib/router-compat";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function VerifyCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleVerification = async () => {
      // Get the hash params from the URL
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const type = hashParams.get('type');
      const accessToken = hashParams.get('access_token');
      
      if (type === 'signup' && accessToken) {
        // This is the email verification callback
        const pendingVerification = localStorage.getItem('pendingVerification');
        
        if (pendingVerification) {
          const { userType, userId, personalEmail } = JSON.parse(pendingVerification);
          
          try {
            // Update verification status to true (personal email was already set)
            let updateError = null;
            if (userType === 'student') {
              const { error } = await supabase
                .from('students')
                .update({ is_verified: true })
                .eq('id', userId);
              updateError = error;
            } else if (userType === 'teacher') {
              const { error } = await supabase
                .from('teachers')
                .update({ is_verified: true })
                .eq('id', userId);
              updateError = error;
            } else if (userType === 'admin') {
              const { error } = await supabase
                .from('admins')
                .update({ is_verified: true })
                .eq('id', userId);
              updateError = error;
            }
            
            if (updateError) {
              console.error('Verification error:', updateError);
              toast.error("Failed to verify account. Please try again.");
            } else {
              // Clear the pending verification
              localStorage.removeItem('pendingVerification');
              
              // Update the local storage for the verified user
              if (userType === 'admin') {
                localStorage.setItem('adminVerified', 'true');
                localStorage.setItem('adminPersonalEmail', personalEmail);
              } else if (userType === 'student') {
                localStorage.setItem('studentVerified', 'true');
                localStorage.setItem('studentPersonalEmail', personalEmail);
              } else if (userType === 'teacher') {
                localStorage.setItem('teacherVerified', 'true');
                localStorage.setItem('teacherPersonalEmail', personalEmail);
              }
              
              toast.success("Your account has been successfully verified!");
            }
          } catch (error) {
            console.error('Verification error:', error);
            toast.error("Failed to verify account. Please try again.");
          }
        }
        
        // Clean up the Supabase session (we don't want to stay logged in with the personal email)
        await supabase.auth.signOut();
      }
      
      // Redirect to login page after a brief delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    };

    handleVerification();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <h2 className="text-2xl font-bold">Verifying your account...</h2>
        <p className="text-muted-foreground">Please wait while we complete the verification process.</p>
      </div>
    </div>
  );
}