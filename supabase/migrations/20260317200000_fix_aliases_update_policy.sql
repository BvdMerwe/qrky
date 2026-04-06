-- Fix aliases UPDATE policy - add WITH CHECK clause
-- The existing policy only has USING, which determines which rows can be updated
-- But UPDATE also needs WITH CHECK to validate the new row values
-- Since we're only updating the 'value' field, we need to ensure user still owns the url_object

-- Drop the existing UPDATE policy
DROP POLICY IF EXISTS "User can update own aliases" ON aliases;

-- Recreate with both USING and WITH CHECK
CREATE POLICY "User can update own aliases" ON aliases 
FOR UPDATE 
USING (
    EXISTS (SELECT 1 FROM url_objects WHERE url_objects.id = aliases.url_object_id AND url_objects.user_id = auth.uid())
)
WITH CHECK (
    EXISTS (SELECT 1 FROM url_objects WHERE url_objects.id = aliases.url_object_id AND url_objects.user_id = auth.uid())
);
