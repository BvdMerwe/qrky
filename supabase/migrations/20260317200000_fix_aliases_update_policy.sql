SET ROLE postgres;

DROP POLICY IF EXISTS "User can update own aliases" ON aliases;
CREATE POLICY "User can update own aliases" ON aliases
FOR UPDATE
USING (
    EXISTS (SELECT 1 FROM url_objects WHERE url_objects.id = aliases.url_object_id AND url_objects.user_id = auth.uid())
)
WITH CHECK (
    EXISTS (SELECT 1 FROM url_objects WHERE url_objects.id = aliases.url_object_id AND url_objects.user_id = auth.uid())
);

RESET ROLE;
