SET ROLE postgres;

DROP POLICY IF EXISTS "Enable read access for all users" ON aliases;
DROP POLICY IF EXISTS "Enable read access for all users" ON qr_codes;
DROP POLICY IF EXISTS "Enable read access for all users" ON url_objects;

DROP POLICY IF EXISTS "Public read access for url_objects" ON url_objects;
CREATE POLICY "Public read access for url_objects" ON url_objects FOR SELECT USING (true);
DROP POLICY IF EXISTS "User can insert own url_objects" ON url_objects;
CREATE POLICY "User can insert own url_objects" ON url_objects FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "User can update own url_objects" ON url_objects;
CREATE POLICY "User can update own url_objects" ON url_objects FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "User can delete own url_objects" ON url_objects;
CREATE POLICY "User can delete own url_objects" ON url_objects FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public read access for qr_codes" ON qr_codes;
CREATE POLICY "Public read access for qr_codes" ON qr_codes FOR SELECT USING (true);
DROP POLICY IF EXISTS "User can insert own qr_codes" ON qr_codes;
CREATE POLICY "User can insert own qr_codes" ON qr_codes FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM url_objects WHERE url_objects.id = qr_codes.url_object_id AND url_objects.user_id = auth.uid())
);
DROP POLICY IF EXISTS "User can update own qr_codes" ON qr_codes;
CREATE POLICY "User can update own qr_codes" ON qr_codes FOR UPDATE USING (
    EXISTS (SELECT 1 FROM url_objects WHERE url_objects.id = qr_codes.url_object_id AND url_objects.user_id = auth.uid())
);
DROP POLICY IF EXISTS "User can delete own qr_codes" ON qr_codes;
CREATE POLICY "User can delete own qr_codes" ON qr_codes FOR DELETE USING (
    EXISTS (SELECT 1 FROM url_objects WHERE url_objects.id = qr_codes.url_object_id AND url_objects.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Public read access for aliases" ON aliases;
CREATE POLICY "Public read access for aliases" ON aliases FOR SELECT USING (true);
DROP POLICY IF EXISTS "User can insert own aliases" ON aliases;
CREATE POLICY "User can insert own aliases" ON aliases FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM url_objects WHERE url_objects.id = aliases.url_object_id AND url_objects.user_id = auth.uid())
);
DROP POLICY IF EXISTS "User can update own aliases" ON aliases;
CREATE POLICY "User can update own aliases" ON aliases FOR UPDATE USING (
    EXISTS (SELECT 1 FROM url_objects WHERE url_objects.id = aliases.url_object_id AND url_objects.user_id = auth.uid())
);
DROP POLICY IF EXISTS "User can delete own aliases" ON aliases;
CREATE POLICY "User can delete own aliases" ON aliases FOR DELETE USING (
    EXISTS (SELECT 1 FROM url_objects WHERE url_objects.id = aliases.url_object_id AND url_objects.user_id = auth.uid())
);

DROP POLICY IF EXISTS "User can view own visits" ON visits;
CREATE POLICY "User can view own visits" ON visits FOR SELECT USING (
    url_object_id IN (SELECT id FROM url_objects WHERE user_id = auth.uid())
);
DROP POLICY IF EXISTS "User can insert own visits" ON visits;
CREATE POLICY "User can insert own visits" ON visits FOR INSERT WITH CHECK (
    url_object_id IN (SELECT id FROM url_objects WHERE user_id = auth.uid())
);

RESET ROLE;
