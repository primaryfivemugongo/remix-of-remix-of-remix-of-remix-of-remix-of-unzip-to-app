import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Mail, Phone, Calendar, MapPin } from "lucide-react";

interface PersonalInfoProps {
  userName: string;
  userRole: string | null;
  userEmail: string | undefined;
  personalEmail: string | null;
  isLoading?: boolean;
}

export function PersonalInfo({ userName, userRole, userEmail, personalEmail, isLoading = false }: PersonalInfoProps) {
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
            {isLoading ? <Skeleton className="h-10" /> : <Input id="name" value={userName} disabled />}
          </div>
          
          {userRole === 'student' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="class">Class</Label>
                <Input id="class" value="Form 4" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stream">Stream</Label>
                <Input id="stream" value="Science" disabled />
              </div>
            </>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="schoolEmail">
              <Mail className="inline mr-2 h-4 w-4" />
              School Email
            </Label>
            {isLoading ? <Skeleton className="h-10" /> : <Input id="schoolEmail" value={userEmail || ""} disabled />}
          </div>

          <div className="space-y-2">
            <Label htmlFor="personalEmailDisplay">
              <Mail className="inline mr-2 h-4 w-4" />
              Personal Email
            </Label>
            {isLoading ? (
              <Skeleton className="h-10" />
            ) : (
              <Input 
                id="personalEmailDisplay" 
                value={personalEmail || "Not set"} 
                disabled 
                className={!personalEmail ? "text-muted-foreground" : ""}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              <Phone className="inline mr-2 h-4 w-4" />
              Phone Number
            </Label>
            <Input id="phone" value="Not set" disabled className="text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob">
              <Calendar className="inline mr-2 h-4 w-4" />
              Date of Birth
            </Label>
            <Input id="dob" value="Not set" disabled className="text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">
              <MapPin className="inline mr-2 h-4 w-4" />
              Address
            </Label>
            <Input id="address" value="Not set" disabled className="text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}