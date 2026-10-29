/** A reset is only allowed with the exact Gmail linked to the school account. */
export function gmailMatches(linked: string | null | undefined, google: string) {
  return !!linked && linked.trim().toLowerCase() === google.trim().toLowerCase();
}

/** School email format: all name letters joined, then .student / .teacher @kpm.com */
export function schoolEmailFor(name: string, role: "student" | "teacher") {
  return `${name.toLowerCase().replace(/[^a-z]/g, "")}.${role}@kpm.com`;
}
