import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { canUnlinkGoogle, resolveGoogleStudent } from "./google-account";

const passwordInput = z.object({ password: z.string().min(1).max(100) });

export const loginWithGoogle = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ password: z.string().max(100).optional() }).parse(input))
  .handler(async ({ data }) => {
    const { getPortalSession, studentLoginResult } = await import("./auth-session.server");
    const { verifiedGoogleIdentity, googleRepository, readStudent } = await import("./google-account.server");
    const identity = await verifiedGoogleIdentity();
    const session = await getPortalSession();
    if (session.data.pendingGoogleLink) throw new Error("Finish linking Google in your account settings first.");
    // A Gmail linked in profile settings signs straight into that school account (any role).
    const { findAccountByLinkedGmail, portalLoginResult } = await import("./recovery.server");
    const linked = await findAccountByLinkedGmail(identity.email);
    if (linked) {
      await session.update({ role: linked.role, userId: linked.id, studentId: linked.role === "student" ? linked.id : undefined });
      return { ...portalLoginResult(linked), created: false };
    }
    const result = await resolveGoogleStudent(googleRepository, identity, data.password);
    if (result.status === "password-required") return { success: false as const, passwordRequired: true as const, email: result.email, message: "Enter your existing portal password to link Google." };
    await session.update({ role: "student", userId: result.student.id, studentId: result.student.id });
    return { ...studentLoginResult(await readStudent(result.student.id)), created: result.created };
  });

export const getGoogleAccountSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { requireStudentSession } = await import("./auth-session.server");
  const { readStudent } = await import("./google-account.server");
  const { id } = await requireStudentSession();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const student = await readStudent(id);
  const { data, error } = await supabaseAdmin.from("student_google_accounts").select("google_email,linked_at").eq("student_id", id).maybeSingle();
  if (error) throw new Error("Account settings unavailable.");
  return { email: student.email, googleEmail: data?.google_email ?? null, linkedAt: data?.linked_at ?? null, hasPassword: canUnlinkGoogle(student.password_hash) };
});

export const beginGoogleLink = createServerFn({ method: "POST" })
  .inputValidator((input) => passwordInput.parse(input))
  .handler(async ({ data }) => {
    const { requireStudentSession } = await import("./auth-session.server");
    const { readStudent, consumeAttempt } = await import("./google-account.server");
    const { verifyPupilPassword } = await import("./pupil-password");
    const { session, id } = await requireStudentSession();
    await consumeAttempt(`google-settings:${id}`);
    if (!await verifyPupilPassword(data.password, (await readStudent(id)).password_hash)) throw new Error("Incorrect portal password.");
    await session.update({ pendingGoogleLink: { studentId: id, expiresAt: Date.now() + 5 * 60 * 1000 } });
    return { success: true };
  });

export const finishGoogleLink = createServerFn({ method: "POST" }).handler(async () => {
  const { requireStudentSession } = await import("./auth-session.server");
  const { verifiedGoogleIdentity, googleRepository } = await import("./google-account.server");
  const { session, id } = await requireStudentSession();
  const pending = session.data.pendingGoogleLink;
  if (!pending || pending.studentId !== id || pending.expiresAt < Date.now()) throw new Error("Link request expired. Confirm your portal password again.");
  await googleRepository.connect(await verifiedGoogleIdentity(), id);
  await session.update({ pendingGoogleLink: undefined });
  return { success: true };
});

export const cancelGoogleLink = createServerFn({ method: "POST" }).handler(async () => {
  const { requireStudentSession } = await import("./auth-session.server");
  const { session } = await requireStudentSession();
  await session.update({ pendingGoogleLink: undefined });
  return { success: true };
});

export const unlinkGoogleAccount = createServerFn({ method: "POST" })
  .inputValidator((input) => passwordInput.parse(input))
  .handler(async ({ data }) => {
    const { requireStudentSession } = await import("./auth-session.server");
    const { readStudent, consumeAttempt } = await import("./google-account.server");
    const { verifyPupilPassword } = await import("./pupil-password");
    const { id, session } = await requireStudentSession();
    const student = await readStudent(id);
    if (!canUnlinkGoogle(student.password_hash)) throw new Error("Set a portal password before unlinking Google.");
    await consumeAttempt(`google-settings:${id}`);
    if (!await verifyPupilPassword(data.password, student.password_hash)) throw new Error("Incorrect portal password.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("student_google_accounts").delete().eq("student_id", id);
    if (error) throw new Error("Could not unlink Google.");
    await session.update({ pendingGoogleLink: undefined });
    return { success: true };
  });

export const setStudentPortalPassword = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ currentPassword: z.string().max(100), newPassword: z.string().min(8).max(72) }).parse(input))
  .handler(async ({ data }) => {
    const { requireStudentSession } = await import("./auth-session.server");
    const { readStudent, consumeAttempt, verifiedGoogleIdentity } = await import("./google-account.server");
    const { verifyPupilPassword } = await import("./pupil-password");
    const { id } = await requireStudentSession();
    const student = await readStudent(id);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await consumeAttempt(`google-settings:${id}`);
    if (canUnlinkGoogle(student.password_hash)) {
      if (!await verifyPupilPassword(data.currentPassword, student.password_hash)) throw new Error("Incorrect portal password.");
    } else {
      const identity = await verifiedGoogleIdentity();
      const { data: link } = await supabaseAdmin.from("student_google_accounts").select("student_id").eq("auth_user_id", identity.id).eq("student_id", id).maybeSingle();
      if (!link) throw new Error("Sign in with your linked Google account before setting a password.");
    }
    const { hash } = await import("bcryptjs");
    const { error } = await supabaseAdmin.from("students").update({ password_hash: await hash(data.newPassword, 10), default_password: null }).eq("id", id).eq("password_hash", student.password_hash).select("id").single();
    if (error) throw new Error("Could not save password. Please try again.");
    return { success: true };
  });