import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { PortalRole } from "./auth-session.server";

export type PortalAccount = { role: PortalRole; id: string; name: string; email: string; personal_email: string | null; password_hash: string | null; is_verified: boolean; photo_url: string | null };
const TABLES = { admin: "admins", teacher: "teachers", student: "students" } as const;
const ROLES: PortalRole[] = ["admin", "teacher", "student"];
const exact = (v: string) => v.trim().toLowerCase().replace(/[\\%_]/g, "\\$&");

async function findBy(column: "email" | "personal_email" | "id", value: string, roles = ROLES): Promise<PortalAccount | null> {
  for (const role of roles) {
    const cols = role === "admin" ? "id,name,email,personal_email,password_hash,is_verified" : "id,name,email,personal_email,password_hash,is_verified,photo_url";
    const q = (supabaseAdmin.from(TABLES[role]) as any).select(cols);
    const { data, error } = await (column === "id" ? q.eq("id", value) : q.ilike(column, exact(value))).limit(1).maybeSingle();
    if (error) throw new Error("Account lookup unavailable.");
    if (data) return { role, photo_url: null, ...data };
  }
  return null;
}

export const findAccountBySchoolEmail = (email: string) => findBy("email", email);
export const findAccountByLinkedGmail = (gmail: string) => findBy("personal_email", gmail);
export const findAccountById = (role: PortalRole, id: string) => findBy("id", id, [role]);

export async function setAccountPassword(account: PortalAccount, password: string) {
  const { hash } = await import("bcryptjs");
  const { error } = await (supabaseAdmin.from(TABLES[account.role]) as any).update({ password_hash: await hash(password, 10), default_password: account.role === "admin" ? undefined : null }).eq("id", account.id);
  if (error) throw new Error("Could not save the new password.");
}

export async function setLinkedGmail(account: PortalAccount, gmail: string | null) {
  if (gmail) {
    const other = await findAccountByLinkedGmail(gmail);
    if (other && !(other.role === account.role && other.id === account.id)) throw new Error("That Gmail is already linked to another school account.");
  }
  const { error } = await (supabaseAdmin.from(TABLES[account.role]) as any).update({ personal_email: gmail }).eq("id", account.id);
  if (error) throw new Error("Could not update the linked Gmail.");
}

export function portalLoginResult(a: PortalAccount) {
  return { success: true as const, role: a.role, name: a.name, email: a.email, token: crypto.randomUUID(), is_verified: !!a.is_verified, user_id: a.id, student_id: a.role === "student" ? a.id : undefined, photo_url: a.photo_url ?? null, personal_email: a.personal_email ?? null };
}
