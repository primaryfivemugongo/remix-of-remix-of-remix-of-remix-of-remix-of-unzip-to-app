import { Navigate, useLocation } from "@/lib/router-compat";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/user";

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
}

export function RoleBasedRoute({ 
  children, 
  allowedRoles, 
  fallbackPath 
}: RoleBasedRouteProps) {
  const { userRole } = useAuth();
  const location = useLocation();
  
  // If user role is not in allowed roles, redirect them
  if (userRole && !allowedRoles.includes(userRole)) {
    // Default fallback is their role-specific dashboard
    const defaultFallback = `/${userRole}`;
    return <Navigate to={fallbackPath || defaultFallback} replace />;
  }
  
  return <>{children}</>;
}