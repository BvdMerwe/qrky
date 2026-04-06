-- Fix RLS policies to add proper user ownership
-- Drop existing permissive policies
DROP POLICY IF EXISTS "Enable read access for all users" ON aliases;
DROP POLICY IF EXISTS "Enable read access for all users" ON qr_codes;
DROP POLICY IF EXISTS "Enable read access for all users" ON url_objects;

-- url_objects: SELECT remains public for URL redirects
CREATE POLICY "Public read access for url_objects" ON url_objects FOR SELECT USING (true);

-- url_objects: INSERT requires authenticated user owns the record
CREATE POLICY "User can insert own url_objects" ON url_objects FOR INSERT WITH CHECK (auth.uid() = user_id);

-- url_objects: UPDATE requires authenticated user owns the record
CREATE POLICY "User can update own url_objects" ON url_objects FOR UPDATE USING (auth.uid() = user_id);

-- url_objects: DELETE requires authenticated user owns the record
CREATE POLICY "User can delete own url_objects" ON url_objects FOR DELETE USING (auth.uid() = user_id);

-- qr_codes: SELECT remains public for QR display
CREATE POLICY "Public read access for qr_codes" ON qr_codes FOR SELECT USING (true);

-- qr_codes: INSERT requires user owns the linked url_object
CREATE POLICY "User can insert own qr_codes" ON qr_codes FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM url_objects WHERE url_objects.id = qr_codes.url_object_id AND url_objects.user_id = auth.uid())
);

-- qr_codes: UPDATE requires user owns the linked url_object
CREATE POLICY "User can update own qr_codes" ON qr_codes FOR UPDATE USING (
    EXISTS (SELECT 1 FROM url_objects WHERE url_objects.id = qr_codes.url_object_id AND url_objects.user_id = auth.uid())
);

-- qr_codes: DELETE requires user owns the linked url_object
CREATE POLICY "User can delete own qr_codes" ON qr_codes FOR DELETE USING (
    EXISTS (SELECT 1 FROM url_objects WHERE url_objects.id = qr_codes.url_object_id AND url_objects.user_id = auth.uid())
);

-- aliases: SELECT remains public for URL redirects
CREATE POLICY "Public read access for aliases" ON aliases FOR SELECT USING (true);

-- aliases: INSERT requires user owns the linked url_object
CREATE POLICY "User can insert own aliases" ON aliases FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM url_objects WHERE url_objects.id = aliases.url_object_id AND url_objects.user_id = auth.uid())
);

-- aliases: UPDATE requires user owns the linked url_object
CREATE POLICY "User can update own aliases" ON aliases FOR UPDATE USING (
    EXISTS (SELECT 1 FROM url_objects WHERE url_objects.id = aliases.url_object_id AND url_objects.user_id = auth.uid())
);

-- aliases: DELETE requires user owns the linked url_object
CREATE POLICY "User can delete own aliases" ON aliases FOR DELETE USING (
    EXISTS (SELECT 1 FROM url_objects WHERE url_objects.id = aliases.url_object_id AND url_objects.user_id = auth.uid())
);

-- visits: Users can only see visits for their own url_objects
CREATE POLICY "User can view own visits" ON visits FOR SELECT USING (
    url_object_id IN (SELECT id FROM url_objects WHERE user_id = auth.uid())
);

-- visits: INSERT requires user owns the linked url_object
CREATE POLICY "User can insert own visits" ON visits FOR INSERT WITH CHECK (
    url_object_id IN (SELECT id FROM url_objects WHERE user_id = auth.uid())
);
