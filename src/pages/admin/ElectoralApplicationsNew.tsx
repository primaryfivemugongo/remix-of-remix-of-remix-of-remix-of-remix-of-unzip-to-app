import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfessionalCard } from "@/components/ui/professional-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Vote, BarChart3 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@/lib/router-compat";
import { VoteMonitoringTab, ApplicationsManagementTab } from "@/components/electoral";

export default function ElectoralApplicationsNew() {
  const navigate = useNavigate();
  const { userName, photoUrl } = useAuth();
  const [activeTab, setActiveTab] = useState("applications");

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <DashboardLayout 
      userRole="admin" 
      userName={userName} 
      photoUrl={photoUrl} 
      onLogout={handleLogout}
    >
      <div className="w-full min-h-screen">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="space-y-6">
            {/* Header */}
            <ProfessionalCard variant="elevated" className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Vote className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        Electoral Management System
                      </h1>
                      <p className="text-muted-foreground text-sm mt-1">
                        Manage applications and monitor voting processes
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => navigate('/admin/ballot-generation')}
                    className="gap-2"
                    size="lg"
                  >
                    <Vote className="h-4 w-4" />
                    Generate Ballots
                  </Button>
                </div>
              </CardHeader>
            </ProfessionalCard>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
                <TabsTrigger value="applications" className="gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Applications</span>
                </TabsTrigger>
                <TabsTrigger value="voting" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Vote Monitoring</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="applications" className="space-y-6">
                <ApplicationsManagementTab />
              </TabsContent>

              <TabsContent value="voting" className="space-y-6">
                <VoteMonitoringTab />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
