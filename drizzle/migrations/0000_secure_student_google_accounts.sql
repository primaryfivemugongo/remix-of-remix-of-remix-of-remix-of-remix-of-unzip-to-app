CREATE UNIQUE INDEX IF NOT EXISTS students_normalized_email_unique ON public.students (lower(trim(email)));
CREATE TABLE public.student_google_accounts (
 student_id uuid PRIMARY KEY REFERENCES public.students(id) ON DELETE CASCADE,
 auth_user_id uuid NOT NULL UNIQUE,
 google_email text NOT NULL,
 linked_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.student_google_accounts TO service_role;
ALTER TABLE public.student_google_accounts ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.portal_auth_attempts (
 attempt_key text PRIMARY KEY,
 attempts integer NOT NULL DEFAULT 0,
 started_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.portal_auth_attempts TO service_role;
ALTER TABLE public.portal_auth_attempts ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.consume_portal_auth_attempt(p_key text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n integer;
BEGIN
 INSERT INTO public.portal_auth_attempts (attempt_key, attempts) VALUES (p_key, 1)
 ON CONFLICT (attempt_key) DO UPDATE SET
 attempts = CASE WHEN portal_auth_attempts.started_at < now() - interval '15 minutes' THEN 1 ELSE portal_auth_attempts.attempts + 1 END,
 started_at = CASE WHEN portal_auth_attempts.started_at < now() - interval '15 minutes' THEN now() ELSE portal_auth_attempts.started_at END
 RETURNING attempts INTO n;
 RETURN n <= 5;
END;
$$;
REVOKE ALL ON FUNCTION public.consume_portal_auth_attempt(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_portal_auth_attempt(text) TO service_role;
CREATE OR REPLACE FUNCTION public.connect_student_google(p_auth_user_id uuid, p_email text, p_name text, p_student_id uuid DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_student uuid; v_existing uuid; v_email text := lower(trim(p_email));
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended('google:' || p_auth_user_id::text, 0));
 PERFORM pg_advisory_xact_lock(hashtextextended('email:' || v_email, 0));
 SELECT student_id INTO v_existing FROM public.student_google_accounts WHERE auth_user_id = p_auth_user_id;
 IF v_existing IS NOT NULL THEN
  IF p_student_id IS NOT NULL AND p_student_id <> v_existing THEN RAISE EXCEPTION 'Google account already linked'; END IF;
  RETURN v_existing;
 END IF;
 IF EXISTS (SELECT 1 FROM public.admins WHERE lower(trim(email)) = v_email) OR EXISTS (SELECT 1 FROM public.teachers WHERE lower(trim(email)) = v_email) THEN
  RAISE EXCEPTION 'Use staff portal sign-in';
 END IF;
 SELECT id INTO v_existing FROM public.students WHERE lower(trim(email)) = v_email;
 IF p_student_id IS NULL THEN
  IF v_existing IS NOT NULL THEN RAISE EXCEPTION 'Existing portal password required'; END IF;
  INSERT INTO public.students (name, email, password_hash, is_verified) VALUES (p_name, v_email, 'google$' || gen_random_uuid()::text, true) RETURNING id INTO v_student;
 ELSE
  v_student := p_student_id;
  PERFORM 1 FROM public.students WHERE id = v_student FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Student not found'; END IF;
  IF v_existing IS NOT NULL AND v_existing <> v_student THEN RAISE EXCEPTION 'Email belongs to another student'; END IF;
 END IF;
 INSERT INTO public.student_google_accounts (student_id, auth_user_id, google_email) VALUES (v_student, p_auth_user_id, v_email);
 RETURN v_student;
END;
$$;
REVOKE ALL ON FUNCTION public.connect_student_google(uuid,text,text,uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.connect_student_google(uuid,text,text,uuid) TO service_role;
REVOKE SELECT ON public.students FROM anon, authenticated;
GRANT SELECT (id, name, class_id, stream_id, photo_url, gender, created_at) ON public.students TO anon, authenticated;
GRANT ALL ON public.students TO service_role;
REVOKE ALL ON public.admins, public.teachers FROM anon, authenticated;
GRANT ALL ON public.admins, public.teachers TO service_role;