-- Fix aliases UPDATE policy - add WITH CHECK clause
DROP POLICY IF EXISTS "User can update own aliases" ON aliases;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'User can update own aliases' AND tablename = 'aliases') THEN
        CREATE POLICY "User can update own aliases" ON aliases
        FOR UPDATE
        USING (
            EXISTS (SELECT 1 FROM url_objects WHERE url_objects.id = aliases.url_object_id AND url_objects.user_id = auth.uid())
        )
        WITH CHECK (
            EXISTS (SELECT 1 FROM url_objects WHERE url_objects.id = aliases.url_object_id AND url_objects.user_id = auth.uid())
        );
    END IF;
END $$;
