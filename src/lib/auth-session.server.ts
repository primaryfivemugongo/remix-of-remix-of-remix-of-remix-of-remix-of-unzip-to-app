import { useSession, setResponseHeader, getRequestUrl } from "@tanstack/react-start/server";

export type PortalRole = "student" | "teacher" | "admin";
type SessionData = { studentId?: string; role?: PortalRole; userId?: string; pendingGoogleLink?: { studentId: string; expiresAt: number } };

export async function getPortalSession() {
  const password = process.env['PUPIL_SESSION_SECRET'];
  if (!password) throw new Error("Sign-in is temporarily unavailable");
  setResponseHeader("Cache-Control", "no-store");
  const url = new URL(getRequestUrl());
  const localHttp = url.protocol === "http:" && (url.hostname === "localhost" || url.hostname === "127.0.0.1");
  return useSession<SessionData>({ password, name: "p5-orange-session", maxAge: 60 * 60 * 24, cookie: { httpOnly: true, sameSite: localHttp ? "lax" : "none", secure: !localHttp, partitioned: !localHttp } });
}

export async function requireStudentSession() {
  const session = await getPortalSession();
  const id = session.data.userId ?? session.data.studentId;
  if (session.data.role !== "student" || !id) throw new Error("Please sign in to your student portal account.");
  return { session, id };
}

export function studentLoginResult(row: { id: string; name: string; email: string; is_verified?: boolean; photo_url?: string | null; personal_email?: string | null }) {
  return { success: true as const, role: "student" as const, name: row.name, email: row.email, token: crypto.randomUUID(), is_verified: !!row.is_verified, user_id: row.id, student_id: row.id, photo_url: row.photo_url ?? null, personal_email: row.personal_email ?? null };
}