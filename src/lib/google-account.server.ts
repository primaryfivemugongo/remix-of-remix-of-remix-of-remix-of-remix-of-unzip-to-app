import { getRequestHeader } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { verifyPupilPassword } from "./pupil-password";
import type { GoogleAccountRepository, GoogleIdentity, PortalStudent } from "./google-account";

export async function verifiedGoogleIdentity(): Promise<GoogleIdentity> {
  const header = getRequestHeader("authorization") ?? "";
  if (!header.startsWith("Bearer ")) throw new Error("Please complete Google sign-in first.");
  const { data, error } = await supabaseAdmin.auth.getUser(header.slice(7));
  const google = data.user?.identities?.find((identity) => identity.provider === "google");
  const email = google?.identity_data?.email;
  if (error || !data.user || !google || typeof email !== "string" || google.identity_data?.email_verified !== true) {
    throw new Error("A verified Google account is required.");
  }
  return { id: data.user.id, email: email.trim().toLowerCase(), name: String(google.identity_data?.full_name ?? google.identity_data?.name ?? email.split("@")[0]).slice(0, 200) };
}

export async function consumeAttempt(key: string) {
  const { data, error } = await supabaseAdmin.rpc("consume_portal_auth_attempt", { p_key: key });
  if (error || !data) throw new Error("Too many attempts. Please try again in 15 minutes.");
}

export async function readStudent(id: string): Promise<PortalStudent & { is_verified: boolean; photo_url: string | null; personal_email: string | null }> {
  const { data, error } = await supabaseAdmin.from("students").select("id,name,email,password_hash,is_verified,photo_url,personal_email").eq("id", id).single();
  if (error || !data) throw new Error("Student account unavailable.");
  return data;
}

export const googleRepository: GoogleAccountRepository = {
  async findLinkedStudent(authId) {
    const { data, error } = await supabaseAdmin.from("student_google_accounts").select("student_id").eq("auth_user_id", authId).maybeSingle();
    if (error) throw new Error("Account lookup unavailable.");
    return data ? readStudent(data.student_id) : null;
  },
  async findStudentByEmail(email) {
    // Escape pattern operators; email matching must be exact, case-insensitive.
    const exact = email.replace(/[\\%_]/g, "\\$&");
    const { data, error } = await supabaseAdmin.from("students").select("id,name,email,password_hash").ilike("email", exact).maybeSingle();
    if (error) throw new Error("Account lookup unavailable.");
    return data;
  },
  async isStaffEmail(email) {
    const exact = email.replace(/[\\%_]/g, "\\$&");
    for (const table of ["admins", "teachers"] as const) {
      const { data, error } = await supabaseAdmin.from(table).select("id").ilike("email", exact).maybeSingle();
      if (error) throw new Error("Account lookup unavailable.");
      if (data) return true;
    }
    return false;
  },
  async verifyPassword(student, password) {
    await consumeAttempt(`google-match:${student.id}`);
    return verifyPupilPassword(password, student.password_hash);
  },
  async connect(identity, studentId) {
    const { data, error } = await supabaseAdmin.rpc("connect_student_google", { p_auth_user_id: identity.id, p_email: identity.email, p_name: identity.name, ...(studentId ? { p_student_id: studentId } : {}) });
    if (error || !data) throw new Error("Google could not be linked. It may already belong to another portal account.");
    return readStudent(data);
  },
};