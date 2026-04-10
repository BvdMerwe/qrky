SET ROLE postgres;

-- Fix RLS policies to add proper user ownership
DROP POLICY IF EXISTS "Enable read access for all users" ON aliases;
DROP POLICY IF EXISTS "Enable read access for all users" ON qr_codes;
DROP POLICY IF EXISTS "Enable read access for all users" ON url_objects;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read access for url_objects' AND tablename = 'url_objects') THEN
        CREATE POLICY "Public read access for url_objects" ON url_objects FOR SELECT USING (true);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'User can insert own url_objects' AND tablename = 'url_objects') THEN
        CREATE POLICY "User can insert own url_objects" ON url_objects FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'User can update own url_objects' AND tablename = 'url_objects') THEN
        CREATE POLICY "User can update own url_objects" ON url_objects FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'User can delete own url_objects' AND tablename = 'url_objects') THEN
        CREATE POLICY "User can delete own url_objects" ON url_objects FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read access for qr_codes' AND tablename = 'qr_codes') THEN
        CREATE POLICY "Public read access for qr_codes" ON qr_codes FOR SELECT USING (true);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'User can insert own qr_codes' AND tablename = 'qr_codes') THEN
        CREATE POLICY "User can insert own qr_codes" ON qr_codes FOR INSERT WITH CHECK (
            EXISTS (SELECT 1 FROM url_objects WHERE url_objects.id = qr_codes.url_object_id AND url_objects.user_id = auth.uid())
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'User can update own qr_codes' AND tablename = 'qr_codes') THEN
        CREATE POLICY "User can update own qr_codes" ON qr_codes FOR UPDATE USING (
            EXISTS (SELECT 1 FROM url_objects WHERE url_objects.id = qr_codes.url_object_id AND url_objects.user_id = auth.uid())
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'User can delete own qr_codes' AND tablename = 'qr_codes') THEN
        CREATE POLICY "User can delete own qr_codes" ON qr_codes FOR DELETE USING (
            EXISTS (SELECT 1 FROM url_objects WHERE url_objects.id = qr_codes.url_object_id AND url_objects.user_id = auth.uid())
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read access for aliases' AND tablename = 'aliases') THEN
        CREATE POLICY "Public read access for aliases" ON aliases FOR SELECT USING (true);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'User can insert own aliases' AND tablename = 'aliases') THEN
        CREATE POLICY "User can insert own aliases" ON aliases FOR INSERT WITH CHECK (
            EXISTS (SELECT 1 FROM url_objects WHERE url_objects.id = aliases.url_object_id AND url_objects.user_id = auth.uid())
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'User can update own aliases' AND tablename = 'aliases') THEN
        CREATE POLICY "User can update own aliases" ON aliases FOR UPDATE USING (
            EXISTS (SELECT 1 FROM url_objects WHERE url_objects.id = aliases.url_object_id AND url_objects.user_id = auth.uid())
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'User can delete own aliases' AND tablename = 'aliases') THEN
        CREATE POLICY "User can delete own aliases" ON aliases FOR DELETE USING (
            EXISTS (SELECT 1 FROM url_objects WHERE url_objects.id = aliases.url_object_id AND url_objects.user_id = auth.uid())
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'User can view own visits' AND tablename = 'visits') THEN
        CREATE POLICY "User can view own visits" ON visits FOR SELECT USING (
            url_object_id IN (SELECT id FROM url_objects WHERE user_id = auth.uid())
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'User can insert own visits' AND tablename = 'visits') THEN
        CREATE POLICY "User can insert own visits" ON visits FOR INSERT WITH CHECK (
            url_object_id IN (SELECT id FROM url_objects WHERE user_id = auth.uid())
        );
    END IF;
END $$;

RESET ROLE;
