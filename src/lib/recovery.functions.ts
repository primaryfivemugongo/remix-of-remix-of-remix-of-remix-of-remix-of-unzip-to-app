import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { gmailMatches } from "./recovery-rules";

async function currentAccount() {
  const { getPortalSession } = await import("./auth-session.server");
  const { findAccountById } = await import("./recovery.server");
  const session = await getPortalSession();
  const role = session.data.role ?? (session.data.studentId ? "student" : undefined);
  const id = session.data.userId ?? session.data.studentId;
  if (!role || !id) throw new Error("Please sign in to your school account.");
  const account = await findAccountById(role, id);
  if (!account) throw new Error("Please sign in to your school account.");
  return account;
}

export const getRecoverySettings = createServerFn({ method: "GET" }).handler(async () => {
  const a = await currentAccount();
  return { role: a.role, schoolEmail: a.email, linkedGmail: a.personal_email };
});

/** Links the Google account the user just verified as their recovery Gmail. */
export const linkRecoveryGmail = createServerFn({ method: "POST" }).handler(async () => {
  const { verifiedGoogleIdentity } = await import("./google-account.server");
  const { setLinkedGmail } = await import("./recovery.server");
  const account = await currentAccount();
  const identity = await verifiedGoogleIdentity();
  await setLinkedGmail(account, identity.email);
  return { linkedGmail: identity.email };
});

export const unlinkRecoveryGmail = createServerFn({ method: "POST" }).handler(async () => {
  const { setLinkedGmail } = await import("./recovery.server");
  await setLinkedGmail(await currentAccount(), null);
  return { success: true };
});

/**
 * Forgot / change password: the caller must have just signed in with Google,
 * and that Gmail must be the one linked to the school account.
 */
export const resetPasswordWithGoogle = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ schoolEmail: z.string().trim().toLowerCase().email().max(255), newPassword: z.string().min(4).max(72) }).parse(input))
  .handler(async ({ data }) => {
    const { verifiedGoogleIdentity, consumeAttempt } = await import("./google-account.server");
    const { findAccountBySchoolEmail, setAccountPassword } = await import("./recovery.server");
    await consumeAttempt(`reset:${data.schoolEmail}`);
    const identity = await verifiedGoogleIdentity();
    const account = await findAccountBySchoolEmail(data.schoolEmail);
    if (!account || !gmailMatches(account.personal_email, identity.email)) {
      throw new Error("This Gmail is not linked to that school account. Use the Gmail saved in your profile.");
    }
    await setAccountPassword(account, data.newPassword);
    return { success: true };
  });
