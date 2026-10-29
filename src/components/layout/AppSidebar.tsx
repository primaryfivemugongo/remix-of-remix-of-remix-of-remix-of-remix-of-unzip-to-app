import { 
  Home, 
  Users, 
  BookOpen, 
  Calendar, 
  FileText, 
  Settings, 
  LogOut,
  GraduationCap,
  TrendingUp,
  MessageSquare,
  ClipboardList,
  Award,
  DollarSign,
  Library,
  UserCheck,
  BarChart3,
  User,
  Clock,
  HelpCircle,
  Vote,
  Trophy,
  Gamepad2,
  CalendarClock,
  Image,
  Package,
  Video,
  Film
} from "lucide-react";
import { Link, useLocation } from "@/lib/router-compat";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserRole } from "@/types/user";

const defaultAvatar = "https://raw.githubusercontent.com/Fresh-Teacher/glorious-gateway-65056-78561-35497/main/src/assets/default-avatar.png";

interface AppSidebarProps {
  userRole: UserRole;
  userName: string;
  photoUrl?: string | null;
  onLogout: () => void;
}

export function AppSidebar({ userRole, userName, photoUrl, onLogout }: AppSidebarProps) {
  const location = useLocation();
  
  const getMenuItems = () => {
    const commonItems = [
      { title: "Dashboard", icon: Home, url: `/${userRole}` },
    ];

    switch (userRole) {
      case "student":
        return [
          { title: "Dashboard", icon: Home, url: "/student" },
          { title: "Profile", icon: User, url: "/student/profile" },
          { title: "Calendar", icon: Calendar, url: "/student/calendar" },
          { title: "My Classes", icon: GraduationCap, url: "/student/classes" },
          { title: "Assignments", icon: ClipboardList, url: "/student/assignments" },
          { title: "My Grades", icon: Award, url: "/student/grades" },
          { title: "Timetable", icon: Clock, url: "/student/timetable" },
          { title: "My Attendance", icon: UserCheck, url: "/student/attendance" },
          { title: "Elections", icon: Vote, url: "/student/electoral" },
          { title: "Hall of Fame", icon: Trophy, url: "/student/hall-of-fame" },
          { title: "Games", icon: Gamepad2, url: "/student/games" },
          { title: "Gallery", icon: Image, url: "/student/gallery" },
          { title: "E-Learning", icon: Video, url: "/student/e-learning" },
          { title: "Entertainment", icon: Film, url: "/student/entertainment" },
          { title: "Events", icon: CalendarClock, url: "/student/events" },
          { title: "Library", icon: Library, url: "/student/library" },
          { title: "Communication", icon: MessageSquare, url: "/student/communication" },
          { title: "Help & Support", icon: HelpCircle, url: "/student/help" },
        ];
      case "teacher":
        return [
          { title: "Dashboard", icon: Home, url: "/teacher" },
          { title: "My Classes", icon: GraduationCap, url: "/teacher/classes" },
          { title: "Students", icon: Users, url: "/teacher/students" },
          { title: "Assignments", icon: ClipboardList, url: "/teacher/assignments" },
          { title: "Grades", icon: TrendingUp, url: "/teacher/grades" },
          { title: "Schedule", icon: Calendar, url: "/teacher/schedule" },
          { title: "Timetable", icon: Clock, url: "/teacher/timetable" },
          { title: "Duty Rota", icon: CalendarClock, url: "/teacher/duty-rota" },
          { title: "Attendance", icon: UserCheck, url: "/teacher/attendance" },
          { title: "Electoral", icon: Vote, url: "/teacher/electoral" },
          { title: "Gallery", icon: Image, url: "/teacher/gallery" },
          { title: "E-Learning", icon: Video, url: "/teacher/e-learning" },
          { title: "Events", icon: Film, url: "/teacher/events" },
          { title: "Messages", icon: MessageSquare, url: "/teacher/messages" },
          { title: "Reports", icon: FileText, url: "/teacher/reports" },
        ];
      case "admin":
        return [
          { title: "Dashboard", icon: Home, url: "/admin" },
          { title: "Students", icon: GraduationCap, url: "/admin/students" },
          { title: "Teachers", icon: Users, url: "/admin/teachers" },
          { title: "Classes", icon: BookOpen, url: "/admin/classes" },
          { title: "Streams", icon: Users, url: "/admin/streams" },
          { title: "Timetable", icon: Clock, url: "/admin/timetable" },
          { title: "Duty Rota", icon: CalendarClock, url: "/admin/duty-rota" },
          { title: "Attendance", icon: UserCheck, url: "/admin/attendance" },
          { title: "Electoral", icon: Vote, url: "/admin/electoral" },
          { title: "Entertainment", icon: Film, url: "/admin/entertainment" },
          { title: "Gallery", icon: Image, url: "/admin/gallery" },
          { title: "E-Learning", icon: Video, url: "/admin/e-learning" },
          { title: "Events", icon: Film, url: "/admin/events" },
          { title: "Stock Management", icon: Package, url: "/admin/stock" },
          { title: "Library", icon: Library, url: "/admin/library" },
          { title: "Analytics", icon: BarChart3, url: "/admin/analytics" },
          { title: "Finance", icon: DollarSign, url: "/admin/finance" },
          { title: "Reports", icon: FileText, url: "/admin/reports" },
          { title: "Settings", icon: Settings, url: "/settings" },
        ];
      default:
        return [{ title: "Dashboard", icon: Home, url: "/" }];
    }
  };

  const menuItems = getMenuItems();
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <Sidebar className="border-r flex flex-col">
      {/* Sticky header section */}
      <div className="sticky top-0 z-10 bg-background p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={photoUrl || defaultAvatar} />
            <AvatarFallback>
              <img src={defaultAvatar} alt="User avatar" className="h-full w-full object-cover" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-semibold">{userName}</p>
            <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <SidebarContent className="flex-1 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link 
                        to={item.url} 
                        className={`flex items-center gap-3 ${
                          isActive ? 'bg-primary text-primary-foreground font-medium' : ''
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <SidebarMenuButton onClick={onLogout} className="w-full text-destructive hover:text-destructive hover:bg-destructive/10">
          <LogOut className="h-4 w-4 mr-3" />
          <span>Logout</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}