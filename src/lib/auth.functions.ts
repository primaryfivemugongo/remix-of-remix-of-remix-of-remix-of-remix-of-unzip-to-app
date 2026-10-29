import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { verifyPupilPassword } from "./pupil-password";

const loginInput = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(1).max(100),
});

type Role = "student" | "teacher" | "admin";
type SessionData = { studentId?: string; role?: Role; userId?: string };
const TABLES: Record<Role, "students" | "teachers" | "admins"> = { student: "students", teacher: "teachers", admin: "admins" };

async function getSession() {
  const { useSession } = await import("@tanstack/react-start/server");
  const password = process.env['PUPIL_SESSION_SECRET'];
  if (!password) return null;
  return useSession<SessionData>({ password, name: "p5-orange-session", maxAge: 60 * 60 * 24, cookie: { httpOnly: true, sameSite: "none", secure: true, partitioned: true } });
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

// Google sign-in: the browser completes OAuth with Supabase, then calls this
// with the Supabase bearer attached (attachSupabaseAuth middleware). We verify
// the token server-side, find-or-create the portal account, and issue the same
// encrypted session cookie as password login.
export const loginWithGoogle = createServerFn({ method: "POST" }).handler(async () => {
  const { getRequestHeader } = await import("@tanstack/react-start/server");
  const authHeader = getRequestHeader("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return { success: false as const, message: "Google sign-in did not complete. Please try again." };

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  const googleUser = userData?.user;
  if (userError || !googleUser?.email) {
    return { success: false as const, message: "Could not verify your Google account. Please try again." };
  }
  const email = googleUser.email.trim().toLowerCase();

  // Match an existing portal account first (staff keep their roles).
  let found: { role: Role; row: any } | null = null;
  for (const role of ["admin", "teacher", "student"] as Role[]) {
    const cols = role === "student"
      ? "id, name, email, is_verified, photo_url, personal_email"
      : role === "teacher" ? "id, name, email, is_verified, photo_url, personal_email"
      : "id, name, email, is_verified, personal_email";
    const { data: row } = await (supabaseAdmin.from(TABLES[role]) as any).select(cols).eq("email", email).maybeSingle();
    if (row) { found = { role, row }; break; }
  }

  // No account yet: create a student account (class/stream default to P5 / P5-ORANGE).
  if (!found) {
    const name =
      (googleUser.user_metadata?.full_name as string | undefined) ||
      (googleUser.user_metadata?.name as string | undefined) ||
      email.split("@")[0];
    const { data: newRow, error: insertError } = await (supabaseAdmin.from("students") as any)
      .insert({
        name,
        email,
        // Google accounts have no portal password; store an unguessable placeholder.
        password_hash: `google$${crypto.randomUUID()}`,
        is_verified: true,
        photo_url: (googleUser.user_metadata?.avatar_url as string | undefined) ?? null,
      })
      .select("id, name, email, is_verified, photo_url, personal_email")
      .single();
    if (insertError || !newRow) {
      return { success: false as const, message: "Could not create your account. Please contact the school office." };
    }
    found = { role: "student", row: newRow };
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
