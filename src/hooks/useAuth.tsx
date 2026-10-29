import { useState, useEffect, createContext, useContext } from "react";
import { useNavigate } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { UserRole } from "@/types/user";
import { toast } from "sonner";
import { getAdminToken, clearAdminSession } from "@/lib/adminAuth";
import { getPupilSession, clearPupilSession } from "@/lib/auth.functions";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole | null;
  userName: string;
  userId: string | null;
  photoUrl: string | null;
  isLoading: boolean;
  isVerified: boolean;
  personalEmail: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userName, setUserName] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [personalEmail, setPersonalEmail] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const restore = async () => {
      try {
        const portal = await getPupilSession();
        if (!active) return;
        setUser(portal ? { id: portal.id, email: portal.email } as User : null);
        setUserRole(portal?.role ?? null);
        setUserName(portal?.name ?? "");
        setPhotoUrl(portal?.photo_url ?? null);
        setIsVerified(portal?.is_verified ?? false);
        setPersonalEmail(portal?.personal_email ?? null);
      } catch {
        if (active) { setUser(null); setUserRole(null); }
      } finally {
        if (active) setIsLoading(false);
      }
    };
    const onStorage = () => { setIsLoading(true); void restore(); };
    window.addEventListener("storage", onStorage);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (active) setSession(nextSession);
      if (event === "SIGNED_OUT") void restore();
    });
    void restore();
    return () => { active = false; subscription.unsubscribe(); window.removeEventListener("storage", onStorage); };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signUp = async (email: string, password: string, fullName: string, role: UserRole) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    if (error) throw error;
  };

  const signOut = async () => {
    await clearPupilSession();
    // CRITICAL SECURITY FIX: Clear ALL storage first to prevent any session leakage
    const keysToPreserve = ['cookieConsent']; // Preserve non-auth data
    const preservedData: Record<string, string> = {};
    
    keysToPreserve.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) preservedData[key] = value;
    });
    
    // Clear everything from localStorage
    localStorage.clear();
    
    // CRITICAL: Clear sessionStorage to prevent voting state leakage between users
    sessionStorage.clear();
    
    // Restore preserved data
    Object.entries(preservedData).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
    
    // Only sign out from Supabase if there's a real session
    {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
    
    // Reset all state immediately
    setUser(null);
    setSession(null);
    setUserRole(null);
    setUserName("");
    setPhotoUrl(null);
    setIsVerified(false);
    setPersonalEmail(null);
    
    // Clear any remaining form data in memory for security
    const event = new CustomEvent('clearFormData');
    window.dispatchEvent(event);
    
    // Use client-side navigation to prevent page reload and double navigation
    navigate('/login', { replace: true });
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      userRole,
      userName,
      userId: user?.id || null,
      photoUrl,
      isLoading,
      isVerified,
      personalEmail,
      signIn,
      signUp,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}