import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AccountVerificationFormProps {
  userType: 'student' | 'teacher' | 'admin';
  userId?: string;
  userName?: string;
  onVerificationComplete?: () => void;
}

export function AccountVerificationForm({ 
  userType, 
  userId, 
  userName,
  onVerificationComplete 
}: AccountVerificationFormProps) {
  const [personalEmail, setPersonalEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const handleEmailChange = (email: string) => {
    setPersonalEmail(email);
    if (email && !validateEmail(email)) {
      setEmailError("Please enter a valid email address");
    } else if (email && email.endsWith('@kpm.com')) {
      setEmailError("Please use your personal email address, not the school email");
    } else {
      setEmailError("");
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!personalEmail) {
      toast.error("Please enter your personal email address");
      return;
    }
    
    if (!validateEmail(personalEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    if (personalEmail.endsWith('@kpm.com')) {
      toast.error("Please use your personal email address, not the school email");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Sign up with the personal email (this will send verification email)
      const { data, error } = await supabase.auth.signUp({
        email: personalEmail,
        password: Math.random().toString(36).slice(-12) + 'Aa1!', // Random secure password
        options: {
          emailRedirectTo: `${window.location.origin}/verify-callback?user_type=${userType}&user_id=${userId}`,
          data: {
            full_name: userName || '',
            role: userType,
            user_id: userId,
            user_type: userType
          },
        },
      });
      
      if (error) {
        if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
          toast.error("This email is already registered. Please use a different email address.");
        } else {
          toast.error(error.message || "Failed to send verification email");
        }
        setIsLoading(false);
        return;
      }
      
      // Check if the user already existed (identities will be empty for existing users)
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        toast.error("This email is already registered. Please use a different email address.");
        setIsLoading(false);
        return;
      }
      
      toast.success("Verification email sent! Please check your inbox to complete the verification.");
      
      // Store the pending verification info
      localStorage.setItem('pendingVerification', JSON.stringify({
        userType,
        userId,
        personalEmail
      }));
      
      if (onVerificationComplete) {
        onVerificationComplete();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send verification email");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-primary" />
          Verify Your Account
        </CardTitle>
        <CardDescription>
          Add your personal email address to gain full access to your dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="personal-email">Personal Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="personal-email"
                type="email"
                placeholder="your.personal@email.com"
                value={personalEmail}
                onChange={(e) => handleEmailChange(e.target.value)}
                disabled={isLoading}
                className="pl-10"
                required
              />
            </div>
            {emailError && (
              <p className="text-xs text-destructive">{emailError}</p>
            )}
            <p className="text-xs text-muted-foreground">
              This email will be used for important communications and account recovery
            </p>
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading || !!emailError}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending verification email...
              </>
            ) : (
              "Send Verification Email"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}