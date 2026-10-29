export function cachePortalLogin(result: { role: string; token: string; name: string; email: string; user_id: string; is_verified: boolean; photo_url: string | null; personal_email: string | null }) {
  for (const role of ["student", "teacher", "admin"]) {
    for (const key of ["Token", "Role", "Name", "Email", "Id", "Verified", "PhotoUrl", "PersonalEmail"]) localStorage.removeItem(`${role}${key}`);
  }
  const role = result.role;
  for (const [key, value] of Object.entries({ Token: result.token, Role: role, Name: result.name, Email: result.email, Id: result.user_id, Verified: String(result.is_verified), PhotoUrl: result.photo_url, PersonalEmail: result.personal_email })) {
    if (value) localStorage.setItem(`${role}${key}`, value);
  }
  window.dispatchEvent(new StorageEvent("storage", { key: `${role}Token`, newValue: result.token }));
}