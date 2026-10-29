import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useNavigate } from "@/lib/router-compat";
import { PersonalInfo } from "@/components/profile/PersonalInfoWithDatabase";
import { DangerZone } from "@/components/profile/DangerZone";
import { PhotoDialog } from "@/components/ui/photo-dialog";
import { Button } from "@/components/ui/button";
import { GoogleAccountSettings } from "@/components/profile/GoogleAccountSettings";

export default function UserProfile() {
  const { userRole, userName, photoUrl, signOut, personalEmail, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.info("You have been logged out");
      navigate("/login");
    } catch (error: any) {
      toast.error("Failed to log out");
    }
  };

  return (
    <DashboardLayout userRole={userRole || "student"} userName={userName} photoUrl={photoUrl} onLogout={handleLogout}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <PhotoDialog photoUrl={photoUrl} userName={userName} />
              <div>
                <CardTitle className="text-2xl">{userName}</CardTitle>
                <CardDescription className="capitalize">{userRole} Account</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Personal Information - Read Only */}
        <PersonalInfo 
          userName={userName}
          userRole={userRole}
          userEmail={user?.email}
          personalEmail={personalEmail}
        />

        {/* Danger Zone - Editable Security Settings */}
        {userRole === "student" ? <><Button variant="outline" onClick={() => navigate("/account-settings")}>Account settings</Button><GoogleAccountSettings /></> : <DangerZone 
          personalEmail={personalEmail}
          userId={user?.id}
          userRole={userRole}
        />}
      </div>
    </DashboardLayout>
  );
}