-- Reset all RLS policies to a known-good state.
--
-- Previous migrations used SET ROLE postgres / RESET ROLE which caused
-- CREATE POLICY statements to fail silently on self-hosted Supabase because
-- tables were owned by supabase_admin. Table ownership has been reassigned
-- to postgres so migrations run cleanly without any role switching.

-- ============================================================
-- url_objects
-- ============================================================

DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON public.url_objects;
DROP POLICY IF EXISTS "Enable users to view their own data only" ON public.url_objects;
DROP POLICY IF EXISTS "Public read access for url_objects" ON public.url_objects;
DROP POLICY IF EXISTS "User can insert own url_objects" ON public.url_objects;
DROP POLICY IF EXISTS "User can update own url_objects" ON public.url_objects;
DROP POLICY IF EXISTS "User can delete own url_objects" ON public.url_objects;
DROP POLICY IF EXISTS "Anon can read url_objects for redirects" ON public.url_objects;
DROP POLICY IF EXISTS "Users can view their own url_objects" ON public.url_objects;

ALTER TABLE public.url_objects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can read url_objects for redirects"
  ON public.url_objects FOR SELECT TO anon USING (true);

CREATE POLICY "Users can view their own url_objects"
  ON public.url_objects FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "User can insert own url_objects"
  ON public.url_objects FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User can update own url_objects"
  ON public.url_objects FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "User can delete own url_objects"
  ON public.url_objects FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- qr_codes
-- ============================================================

DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON public.qr_codes;
DROP POLICY IF EXISTS "Enable users to view their own data only" ON public.qr_codes;
DROP POLICY IF EXISTS "Public read access for qr_codes" ON public.qr_codes;
DROP POLICY IF EXISTS "User can insert own qr_codes" ON public.qr_codes;
DROP POLICY IF EXISTS "User can update own qr_codes" ON public.qr_codes;
DROP POLICY IF EXISTS "User can delete own qr_codes" ON public.qr_codes;
DROP POLICY IF EXISTS "Anon can read qr_codes for display" ON public.qr_codes;
DROP POLICY IF EXISTS "Users can view their own qr_codes" ON public.qr_codes;

ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can read qr_codes for display"
  ON public.qr_codes FOR SELECT TO anon USING (true);

CREATE POLICY "Users can view their own qr_codes"
  ON public.qr_codes FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.url_objects
      WHERE url_objects.id = qr_codes.url_object_id
        AND url_objects.user_id = auth.uid()
    )
  );

CREATE POLICY "User can insert own qr_codes"
  ON public.qr_codes FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.url_objects
      WHERE url_objects.id = qr_codes.url_object_id
        AND url_objects.user_id = auth.uid()
    )
  );

CREATE POLICY "User can update own qr_codes"
  ON public.qr_codes FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.url_objects
      WHERE url_objects.id = qr_codes.url_object_id
        AND url_objects.user_id = auth.uid()
    )
  );

CREATE POLICY "User can delete own qr_codes"
  ON public.qr_codes FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.url_objects
      WHERE url_objects.id = qr_codes.url_object_id
        AND url_objects.user_id = auth.uid()
    )
  );

-- ============================================================
-- aliases
-- ============================================================

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.aliases;
DROP POLICY IF EXISTS "Enable users to view their own data only" ON public.aliases;
DROP POLICY IF EXISTS "Public read access for aliases" ON public.aliases;
DROP POLICY IF EXISTS "User can insert own aliases" ON public.aliases;
DROP POLICY IF EXISTS "User can update own aliases" ON public.aliases;
DROP POLICY IF EXISTS "User can delete own aliases" ON public.aliases;
DROP POLICY IF EXISTS "Anon can read aliases for redirects" ON public.aliases;
DROP POLICY IF EXISTS "Users can view their own aliases" ON public.aliases;

ALTER TABLE public.aliases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can read aliases for redirects"
  ON public.aliases FOR SELECT TO anon USING (true);

CREATE POLICY "Users can view their own aliases"
  ON public.aliases FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.url_objects
      WHERE url_objects.id = aliases.url_object_id
        AND url_objects.user_id = auth.uid()
    )
  );

CREATE POLICY "User can insert own aliases"
  ON public.aliases FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.url_objects
      WHERE url_objects.id = aliases.url_object_id
        AND url_objects.user_id = auth.uid()
    )
  );

CREATE POLICY "User can update own aliases"
  ON public.aliases FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.url_objects
      WHERE url_objects.id = aliases.url_object_id
        AND url_objects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.url_objects
      WHERE url_objects.id = aliases.url_object_id
        AND url_objects.user_id = auth.uid()
    )
  );

CREATE POLICY "User can delete own aliases"
  ON public.aliases FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.url_objects
      WHERE url_objects.id = aliases.url_object_id
        AND url_objects.user_id = auth.uid()
    )
  );

-- ============================================================
-- visits
-- ============================================================

DROP POLICY IF EXISTS "User can view own visits" ON public.visits;
DROP POLICY IF EXISTS "User can insert own visits" ON public.visits;

ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User can view own visits"
  ON public.visits FOR SELECT TO authenticated USING (
    (
      url_object_id IS NOT NULL
      AND url_object_id IN (SELECT id FROM public.url_objects WHERE user_id = auth.uid())
    )
    OR (
      alias_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.aliases
        JOIN public.url_objects ON url_objects.id = aliases.url_object_id
        WHERE aliases.id = visits.alias_id
          AND url_objects.user_id = auth.uid()
      )
    )
    OR (
      qr_code_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.qr_codes
        JOIN public.url_objects ON url_objects.id = qr_codes.url_object_id
        WHERE qr_codes.id = visits.qr_code_id
          AND url_objects.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "User can insert own visits"
  ON public.visits FOR INSERT TO authenticated WITH CHECK (
    (
      url_object_id IS NOT NULL
      AND url_object_id IN (SELECT id FROM public.url_objects WHERE user_id = auth.uid())
    )
    OR (
      alias_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.aliases
        JOIN public.url_objects ON url_objects.id = aliases.url_object_id
        WHERE aliases.id = visits.alias_id
          AND url_objects.user_id = auth.uid()
      )
    )
    OR (
      qr_code_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.qr_codes
        JOIN public.url_objects ON url_objects.id = qr_codes.url_object_id
        WHERE qr_codes.id = visits.qr_code_id
          AND url_objects.user_id = auth.uid()
      )
    )
  );

-- ============================================================
-- storage.objects (qr-logos bucket)
-- ============================================================

DROP POLICY IF EXISTS "Public read access to qr-logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to own qr-logos folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can manage own qr-logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own qr-logos" ON storage.objects;

CREATE POLICY "Public read access to qr-logos"
  ON storage.objects FOR SELECT USING (bucket_id = 'qr-logos');

CREATE POLICY "Users can upload to own qr-logos folder"
  ON storage.objects FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'qr-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can manage own qr-logos"
  ON storage.objects FOR DELETE TO authenticated USING (
    bucket_id = 'qr-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own qr-logos"
  ON storage.objects FOR UPDATE TO authenticated USING (
    bucket_id = 'qr-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );


