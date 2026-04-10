SET ROLE postgres;

DROP POLICY IF EXISTS "Public read access for url_objects" ON url_objects;
DROP POLICY IF EXISTS "Public read access for qr_codes" ON qr_codes;
DROP POLICY IF EXISTS "Public read access for aliases" ON aliases;

DROP POLICY IF EXISTS "Anon can read url_objects for redirects" ON url_objects;
CREATE POLICY "Anon can read url_objects for redirects" ON url_objects FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS "Users can view their own url_objects" ON url_objects;
CREATE POLICY "Users can view their own url_objects" ON url_objects FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anon can read qr_codes for display" ON qr_codes;
CREATE POLICY "Anon can read qr_codes for display" ON qr_codes FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS "Users can view their own qr_codes" ON qr_codes;
CREATE POLICY "Users can view their own qr_codes" ON qr_codes FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM url_objects WHERE url_objects.id = qr_codes.url_object_id AND url_objects.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Anon can read aliases for redirects" ON aliases;
CREATE POLICY "Anon can read aliases for redirects" ON aliases FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS "Users can view their own aliases" ON aliases;
CREATE POLICY "Users can view their own aliases" ON aliases FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM url_objects WHERE url_objects.id = aliases.url_object_id AND url_objects.user_id = auth.uid())
);

RESET ROLE;
