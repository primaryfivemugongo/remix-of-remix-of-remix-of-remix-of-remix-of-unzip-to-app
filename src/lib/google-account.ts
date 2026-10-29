export interface GoogleIdentity { id: string; email: string; name: string }
export interface PortalStudent { id: string; name: string; email: string; password_hash: string }
export interface GoogleAccountRepository {
  findLinkedStudent: (authId: string) => Promise<PortalStudent | null>;
  findStudentByEmail: (email: string) => Promise<PortalStudent | null>;
  isStaffEmail: (email: string) => Promise<boolean>;
  verifyPassword: (student: PortalStudent, password: string) => Promise<boolean>;
  connect: (identity: GoogleIdentity, studentId?: string) => Promise<PortalStudent>;
}

export async function resolveGoogleStudent(repo: GoogleAccountRepository, identity: GoogleIdentity, password?: string) {
  const linked = await repo.findLinkedStudent(identity.id);
  if (linked) return { status: "signed-in" as const, student: linked, created: false };
  if (await repo.isStaffEmail(identity.email)) throw new Error("Staff accounts must use portal email and password sign-in.");
  const existing = await repo.findStudentByEmail(identity.email);
  if (existing) {
    if (!password) return { status: "password-required" as const, email: existing.email };
    if (!await repo.verifyPassword(existing, password)) throw new Error("Incorrect portal password.");
    return { status: "signed-in" as const, student: await repo.connect(identity, existing.id), created: false };
  }
  return { status: "signed-in" as const, student: await repo.connect(identity), created: true };
}

export function canUnlinkGoogle(passwordHash: string) {
  return /^\$2[aby]\$/.test(passwordHash);
}