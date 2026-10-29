import { compare } from "bcryptjs";

export async function verifyPupilPassword(password: string, hash: string): Promise<boolean> {
  if (!/^\$2[aby]\$/.test(hash)) return false;
  return compare(password, hash);
}