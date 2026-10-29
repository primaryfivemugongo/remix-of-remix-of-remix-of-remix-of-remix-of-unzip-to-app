import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { verifyPupilPassword } from "./pupil-password";

const loginInput = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(1).max(100),
});

type Role = "student" | "teacher" | "admin";
const TABLES: Record<Role, "students" | "teachers" | "admins"> = { student: "students", teacher: "teachers", admin: "admins" };
async function getSession() {
  const { getPortalSession } = await import("./auth-session.server");
  return getPortalSession();
}

export const verifyPupilLogin = createServerFn({ method: "POST" })
  .inputValidator((data) => loginInput.parse(data))
  .handler(async ({ data }) => {
    // Privileged pre-auth lookup: users have no session yet.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let found: { role: Role; row: any } | null = null;
    for (const role of ["admin", "teacher", "student"] as Role[]) {
      const cols = role === "student"
        ? "id, name, email, password_hash, is_verified, photo_url, class_id, stream_id, personal_email"
        : role === "teacher" ? "id, name, email, password_hash, is_verified, photo_url, personal_email"
        : "id, name, email, password_hash, is_verified, personal_email";
      const { data: row } = await (supabaseAdmin.from(TABLES[role]) as any).select(cols).eq("email", data.email).maybeSingle();
      if (row) { found = { role, row }; break; }
    }
    if (!found || !await verifyPupilPassword(data.password, found.row.password_hash)) {
      return { success: false as const, message: "Invalid email or password" };
    }

    const session = await getSession();
    if (!session) throw new Error("Sign-in is temporarily unavailable");
    const { role, row } = found;
    await session.update({ role, userId: row.id, studentId: role === "student" ? row.id : undefined });
    const { setResponseHeader } = await import("@tanstack/react-start/server");
    setResponseHeader("Cache-Control", "no-store");

    return {
      success: true as const,
      role,
      name: row.name as string,
      email: row.email as string,
      token: crypto.randomUUID(),
      is_verified: !!row.is_verified,
      user_id: row.id as string,
      student_id: role === "student" ? (row.id as string) : undefined,
      photo_url: (row.photo_url ?? null) as string | null,
      personal_email: (row.personal_email ?? null) as string | null,
    };
  });

export const getPupilSession = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getSession();
  if (!session) return null;
  const role: Role | undefined = session.data.role ?? (session.data.studentId ? "student" : undefined);
  const id = session.data.userId ?? session.data.studentId;
  if (!role || !id) return null;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const cols = role === "admin" ? "id, name, email, is_verified, personal_email" : "id, name, email, photo_url, is_verified, personal_email";
  const { data } = await (supabaseAdmin.from(TABLES[role]) as any).select(cols).eq("id", id).maybeSingle();
  if (!data) return null;
  return { role, id: data.id as string, name: data.name as string, email: data.email as string, photo_url: (data.photo_url ?? null) as string | null, is_verified: !!data.is_verified, personal_email: (data.personal_email ?? null) as string | null };
});

export const clearPupilSession = createServerFn({ method: "POST" }).handler(async () => {
  const session = await getSession();
  if (session) await session.clear();
  return { success: true };
});
