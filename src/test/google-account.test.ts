import { describe, expect, it, vi } from "vitest";
import { canUnlinkGoogle, resolveGoogleStudent, type GoogleAccountRepository } from "@/lib/google-account";

const identity = { id: "google-user", email: "pupil@example.com", name: "New Pupil" };
const existing = { id: "student-1", name: "Existing", email: identity.email, password_hash: "$2b$10$hash" };
function repo(overrides: Partial<GoogleAccountRepository> = {}): GoogleAccountRepository {
  return { findLinkedStudent: vi.fn(async () => null), findStudentByEmail: vi.fn(async () => null), isStaffEmail: vi.fn(async () => false), verifyPassword: vi.fn(async () => true), connect: vi.fn(async (_i, id) => ({ ...existing, id: id ?? "new-student" })), ...overrides };
}

describe("Google student accounts", () => {
  it("requires the existing student's portal password before matching by email", async () => {
    const r = repo({ findStudentByEmail: vi.fn(async () => existing) });
    await expect(resolveGoogleStudent(r, identity)).resolves.toMatchObject({ status: "password-required" });
    expect(r.connect).not.toHaveBeenCalled();
  });
  it("links a matching student only after the correct password", async () => {
    const r = repo({ findStudentByEmail: vi.fn(async () => existing) });
    await expect(resolveGoogleStudent(r, identity, "correct")).resolves.toMatchObject({ status: "signed-in", created: false });
    expect(r.connect).toHaveBeenCalledWith(identity, "student-1");
  });
  it("creates an unmatched student immediately", async () => {
    const r = repo();
    await expect(resolveGoogleStudent(r, identity)).resolves.toMatchObject({ status: "signed-in", created: true });
    expect(r.connect).toHaveBeenCalledWith(identity);
  });
  it("blocks Google-only accounts from unlinking until a portal password exists", () => {
    expect(canUnlinkGoogle("google$random")).toBe(false);
    expect(canUnlinkGoogle("$2b$10$hash")).toBe(true);
  });
});