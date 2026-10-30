CREATE TABLE public.coordinator_settings (id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1), voting_open boolean NOT NULL DEFAULT true, applications_open boolean NOT NULL DEFAULT true, results_public boolean NOT NULL DEFAULT true, announcement text, voting_starts_at timestamptz, voting_ends_at timestamptz, page_views bigint NOT NULL DEFAULT 0, updated_at timestamptz NOT NULL DEFAULT now(), CHECK (voting_starts_at IS NULL OR voting_ends_at IS NULL OR voting_ends_at > voting_starts_at));
GRANT ALL ON public.coordinator_settings TO service_role;
ALTER TABLE public.coordinator_settings ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.coordinator_applications (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid UNIQUE REFERENCES public.students(id), student_name text NOT NULL, class_name text NOT NULL CHECK (class_name IN ('P1','P2','P3','P4','P5','P6','P7')), stream_name text CHECK (stream_name IN ('Orange','Violet')), age integer CHECK (age BETWEEN 6 AND 15), position text NOT NULL CHECK (position IN ('english_coordinator','science_coordinator','social_studies_coordinator','mathematics_coordinator','religious_education_coordinator')), experience text, manifesto text NOT NULL DEFAULT '', photo_url text, manifesto_photos text[] NOT NULL DEFAULT '{}', youtube_url text, status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')), view_count bigint NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(id,position));
GRANT ALL ON public.coordinator_applications TO service_role;
ALTER TABLE public.coordinator_applications ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.coordinator_votes (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), voter_id uuid NOT NULL REFERENCES public.students(id), application_id uuid NOT NULL, position text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(voter_id,position), FOREIGN KEY(application_id,position) REFERENCES public.coordinator_applications(id,position) ON DELETE CASCADE);
GRANT ALL ON public.coordinator_votes TO service_role;
ALTER TABLE public.coordinator_votes ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.coordinator_commission_roles (user_id uuid PRIMARY KEY REFERENCES public.students(id), granted_by uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.coordinator_commission_roles TO service_role;
ALTER TABLE public.coordinator_commission_roles ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION public.validate_coordinator_vote() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE s public.coordinator_settings; candidate_status text;
BEGIN
 SELECT * INTO s FROM public.coordinator_settings WHERE id=1 FOR SHARE;
 IF NOT FOUND OR NOT s.voting_open OR (s.voting_starts_at IS NOT NULL AND now()<s.voting_starts_at) OR (s.voting_ends_at IS NOT NULL AND now()>s.voting_ends_at) THEN RAISE EXCEPTION 'Voting is not open'; END IF;
 SELECT status INTO candidate_status FROM public.coordinator_applications WHERE id=NEW.application_id AND position=NEW.position FOR SHARE;
 IF candidate_status IS DISTINCT FROM 'approved' THEN RAISE EXCEPTION 'This candidate is not approved for this position'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER coordinator_vote_integrity BEFORE INSERT ON public.coordinator_votes FOR EACH ROW EXECUTE FUNCTION public.validate_coordinator_vote();
CREATE FUNCTION public.coordinator_record_view(_candidate uuid DEFAULT NULL) RETURNS void LANGUAGE plpgsql SET search_path=public AS $$ BEGIN IF _candidate IS NULL THEN UPDATE public.coordinator_settings SET page_views=page_views+1 WHERE id=1; ELSE UPDATE public.coordinator_applications SET view_count=view_count+1 WHERE id=_candidate AND status='approved'; END IF; END $$;
REVOKE ALL ON FUNCTION public.coordinator_record_view(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.coordinator_record_view(uuid) TO service_role;
COMMENT ON TABLE public.electoral_applications IS 'DEPRECATED: replaced by coordinator_applications; old election system retired.';
COMMENT ON TABLE public.electoral_votes IS 'DEPRECATED: replaced by coordinator_votes; old election system retired.';
COMMENT ON TABLE public.electoral_rows IS 'DEPRECATED: coordinator positions are defined by the imported coordinator election rules.';