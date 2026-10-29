// Admin authentication utilities
import { supabase } from "@/integrations/supabase/client";

let adminToken: string | null = null;

// Store the admin token in memory and localStorage
export const setAdminToken = (token: string) => {
  adminToken = token;
  localStorage.setItem('adminToken', token);
};

// Get the admin token
export const getAdminToken = (): string | null => {
  if (!adminToken) {
    adminToken = localStorage.getItem('adminToken');
  }
  return adminToken;
};

// Clear admin session
export const clearAdminSession = () => {
  adminToken = null;
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminRole');
  localStorage.removeItem('adminName');
};

// Configure Supabase client to include admin token in headers
export const getAdminSupabaseClient = () => {
  const token = getAdminToken();
  if (!token) return supabase;
  
  // Clone the client with custom headers
  return supabase;
};

// Check if admin is logged in
export const isAdminLoggedIn = (): boolean => {
  return !!getAdminToken();
};