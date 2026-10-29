REVOKE ALL ON public.student_google_accounts, public.portal_auth_attempts FROM anon, authenticated;
GRANT ALL ON public.student_google_accounts, public.portal_auth_attempts TO service_role;