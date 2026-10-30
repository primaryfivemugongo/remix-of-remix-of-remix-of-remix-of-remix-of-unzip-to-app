export function isCommission(role: string | undefined, membership: boolean) {
  return role === "admin" || membership;
}
export function canSubmitApplication(role: string | undefined, open: boolean, status?: string) {
  return role === "student" && open && (!status || status === "pending");
}