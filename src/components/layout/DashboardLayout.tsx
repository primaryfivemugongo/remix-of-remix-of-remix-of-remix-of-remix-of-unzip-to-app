import classCrest from "@/assets/class-crest.png.asset.json";
import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { UserRole } from "@/types/user";
import { Footer } from "./Footer";
import { useNavigate } from "@/lib/router-compat";
import { UserAvatarDropdown } from "@/components/ui/user-avatar-dropdown";
import { WhatsAppFloat } from "@/components/ui/whatsapp-float";
import { school } from "@/lib/school";
import { PageTransition } from "@/components/PageTransition";

interface DashboardLayoutProps {
  children: ReactNode;
  userRole: UserRole;
  userName: string;
  photoUrl?: string | null;
  onLogout: () => void;
}

export function DashboardLayout({ children, userRole, userName, photoUrl, onLogout }: DashboardLayoutProps) {
  const navigate = useNavigate();
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar userRole={userRole} userName={userName} photoUrl={photoUrl} onLogout={onLogout} />
        <div className="flex-1 min-w-0 flex flex-col">
          <header className="sticky top-0 z-50 min-h-20 border-b bg-card/95 backdrop-blur-sm flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex min-w-0 items-center">
              <SidebarTrigger className="mr-3 shrink-0" />
              <button
                type="button"
                onClick={() => navigate(`/${userRole}`)}
                className="flex min-w-0 items-center rounded-md text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Go to your ${userRole} dashboard`}
              >
                <img src={classCrest.url} alt={`${school.name} crest`} className="h-11 w-11 shrink-0 object-contain mr-2" />
                <div className="min-w-0">
                  <h1 className="text-lg font-bold leading-tight">KPM</h1>
                  <p className="text-xs italic text-muted-foreground">{school.motto}</p>
                </div>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <UserAvatarDropdown 
                userName={userName} 
                photoUrl={photoUrl} 
                onLogout={onLogout} 
              />
            </div>
          </header>
          <main className="flex-1 p-6 bg-gradient-subtle">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
        </div>
      </div>
      <WhatsAppFloat />
    </SidebarProvider>
  );
}