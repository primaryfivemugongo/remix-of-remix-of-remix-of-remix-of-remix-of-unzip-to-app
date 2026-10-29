import { useEffect } from "react";
import { Navigate, useLocation } from "@/lib/router-compat";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, userRole, isLoading } = useAuth();
  const location = useLocation();

  // Handle email confirmation redirect
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    const accessToken = hashParams.get('access_token');
    
    if (type === 'email' && accessToken) {
      // Store the intended destination
      localStorage.setItem('redirectAfterLogin', location.pathname);
      // Clear the hash and redirect to login
      window.location.href = '/login';
    }
  }, [location]);

  if (isLoading) {
    // The shared school crest overlay covers session restoration.
    return <div className="min-h-screen" aria-busy="true" />;
  }

  if (!user || !userRole) {
    // Store redirect path for user trying to access a protected route
    const currentPath = location.pathname + location.search;
    
    // Only set redirect if it's not the login page and not the root page
    // This helps maintain user's intended destination
    if (currentPath !== '/login' && currentPath !== '/') {
      localStorage.setItem('redirectAfterLogin', currentPath);
    } else {
      localStorage.removeItem('redirectAfterLogin');
    }
    
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}