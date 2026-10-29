import { useEffect } from "react";
import { useNavigate, useLocation } from "@/lib/router-compat";
import { useAuth } from "@/hooks/useAuth";

export function RoleBasedRedirect() {
  const { userRole, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only redirect if user is on the root path "/" and we have a role
    if (!isLoading && userRole && location.pathname === "/") {
      const roleBasedPath = `/${userRole}`;
      navigate(roleBasedPath, { replace: true });
    }
  }, [userRole, isLoading, navigate, location.pathname]);

  return null; // This component doesn't render anything
}