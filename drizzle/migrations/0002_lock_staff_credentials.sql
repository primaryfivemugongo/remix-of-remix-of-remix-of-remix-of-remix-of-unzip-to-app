REVOKE INSERT, UPDATE, SELECT ON public.teachers FROM anon, authenticated;
GRANT SELECT (id, name, email, personal_email, nationality, sex, "contactNumber", "subjectsTaught", "classesTaught", photo_url, default_password, is_verified, created_at, updated_at) ON public.teachers TO anon, authenticated;
GRANT INSERT (id, name, email, nationality, sex, "contactNumber", "subjectsTaught", "classesTaught", photo_url, default_password, is_verified, created_at, updated_at) ON public.teachers TO anon, authenticated;
GRANT UPDATE (name, email, nationality, sex, "contactNumber", "subjectsTaught", "classesTaught", photo_url, is_verified, updated_at) ON public.teachers TO anon, authenticated;
REVOKE INSERT, UPDATE, SELECT ON public.admins FROM anon, authenticated;
GRANT SELECT (id, name, email, personal_email, is_verified, created_at, updated_at) ON public.admins TO anon, authenticated;
GRANT UPDATE (name, is_verified, updated_at) ON public.admins TO anon, authenticated;
CREATE UNIQUE INDEX IF NOT EXISTS teachers_email_lower_key ON public.teachers (lower(trim(email)));
CREATE UNIQUE INDEX IF NOT EXISTS admins_email_lower_key ON public.admins (lower(trim(email)));