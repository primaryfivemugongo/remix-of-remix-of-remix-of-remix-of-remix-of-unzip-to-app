import { describe, it, expect } from "vitest";
import { hash } from "bcryptjs";
import { verifyPupilPassword } from "@/lib/pupil-password";

describe("Pupil credentials", () => {
  it("accepts the initial class password against a bcrypt hash", async () => {
    const storedHash = await hash("6667", 4);
    expect(await verifyPupilPassword("6667", storedHash)).toBe(true);
  });
  it("rejects incorrect passwords", async () => {
    const storedHash = await hash("6667", 4);
    expect(await verifyPupilPassword("wrong-password", storedHash)).toBe(false);
  });
  it("never accepts plaintext password storage", async () => {
    expect(await verifyPupilPassword("6667", "6667")).toBe(false);
  });
});