-- Fix conflicting RLS SELECT policies
-- Drop the conflicting public SELECT policies from 20251115120000
DROP POLICY IF EXISTS "Public read access for url_objects" ON url_objects;
DROP POLICY IF EXISTS "Public read access for qr_codes" ON qr_codes;
DROP POLICY IF EXISTS "Public read access for aliases" ON aliases;

-- Anon-role specific SELECT policies for redirect/display routes
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anon can read url_objects for redirects' AND tablename = 'url_objects') THEN
        CREATE POLICY "Anon can read url_objects for redirects" ON url_objects FOR SELECT TO anon USING (true);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own url_objects' AND tablename = 'url_objects') THEN
        CREATE POLICY "Users can view their own url_objects" ON url_objects FOR SELECT TO authenticated USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anon can read qr_codes for display' AND tablename = 'qr_codes') THEN
        CREATE POLICY "Anon can read qr_codes for display" ON qr_codes FOR SELECT TO anon USING (true);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own qr_codes' AND tablename = 'qr_codes') THEN
        CREATE POLICY "Users can view their own qr_codes" ON qr_codes FOR SELECT TO authenticated USING (
            EXISTS (SELECT 1 FROM url_objects WHERE url_objects.id = qr_codes.url_object_id AND url_objects.user_id = auth.uid())
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anon can read aliases for redirects' AND tablename = 'aliases') THEN
        CREATE POLICY "Anon can read aliases for redirects" ON aliases FOR SELECT TO anon USING (true);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own aliases' AND tablename = 'aliases') THEN
        CREATE POLICY "Users can view their own aliases" ON aliases FOR SELECT TO authenticated USING (
            EXISTS (SELECT 1 FROM url_objects WHERE url_objects.id = aliases.url_object_id AND url_objects.user_id = auth.uid())
        );
    END IF;
END $$;
