import { describe, expect, it } from "vitest";
import { isCommission, canSubmitApplication } from "@/lib/coordinator/access";
import { POSITIONS, contestStatus, positionsForClass } from "@/lib/coordinator/rules";

describe("Coordinator elections", () => {
  it("provides the five coordinator contests", () => {
    expect(POSITIONS.map(p => p.value)).toEqual(["english_coordinator", "science_coordinator", "social_studies_coordinator", "mathematics_coordinator", "religious_education_coordinator"]);
  });
  it("allows all five contests for P1 through P7, but not other classes", () => {
    for (const c of ["P1", "P2", "P3", "P4", "P5", "P6", "P7"]) expect(positionsForClass(c)).toHaveLength(5);
    expect(positionsForClass("P8")).toHaveLength(0);
  });
  it("does not grant teachers or students Commission access without membership", () => {
    expect(isCommission("teacher", false)).toBe(false);
    expect(isCommission("student", false)).toBe(false);
    expect(isCommission("admin", false)).toBe(true);
    expect(isCommission("student", true)).toBe(true);
  });
  it("only pupils can submit while applications are open and unreviewed", () => {
    expect(canSubmitApplication("student", true)).toBe(true);
    expect(canSubmitApplication("student", true, "pending")).toBe(true);
    expect(canSubmitApplication("teacher", true)).toBe(false);
    expect(canSubmitApplication("student", false)).toBe(false);
    expect(canSubmitApplication("student", true, "approved")).toBe(false);
    expect(canSubmitApplication("student", true, "rejected")).toBe(false);
  });
  it("blocks voting before start, after end and when closed", () => {
    const s = { voting_open: true, voting_starts_at: "2026-10-30T07:00:00Z", voting_ends_at: "2026-10-30T08:00:00Z" };
    expect(contestStatus(s, new Date("2026-10-30T06:59:00Z"))).toBe("upcoming");
    expect(contestStatus(s, new Date("2026-10-30T07:30:00Z"))).toBe("ongoing");
    expect(contestStatus(s, new Date("2026-10-30T08:01:00Z"))).toBe("finished");
    expect(contestStatus({ ...s, voting_open: false }, new Date("2026-10-30T07:30:00Z"))).toBe("finished");
  });
});