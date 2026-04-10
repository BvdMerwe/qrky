SET ROLE postgres;

-- Fix visits RLS policies to cover alias and QR code visit rows.
--
-- The previous policies only checked url_object_id, but alias and QR code
-- visits store NULL in url_object_id — they only set alias_id or qr_code_id.
-- This made those visit rows invisible to authenticated users (SELECT blocked)
-- and would block direct INSERTs too (record_view is SECURITY DEFINER so its
-- INSERTs currently bypass RLS, but the policy should be correct regardless).
--
-- Each policy now covers three join paths:
--   1. url_object_id → url_objects.user_id = auth.uid()
--   2. alias_id      → aliases.url_object_id → url_objects.user_id = auth.uid()
--   3. qr_code_id    → qr_codes.url_object_id → url_objects.user_id = auth.uid()

DROP POLICY IF EXISTS "User can view own visits" ON visits;
DROP POLICY IF EXISTS "User can insert own visits" ON visits;

-- SELECT: user can see a visit row if any of its foreign keys traces back to
-- a url_object they own.
CREATE POLICY "User can view own visits" ON visits FOR SELECT USING (
    (
        url_object_id IS NOT NULL
        AND url_object_id IN (SELECT id FROM url_objects WHERE user_id = auth.uid())
    )
    OR (
        alias_id IS NOT NULL
        AND EXISTS (
            SELECT 1
            FROM aliases
            JOIN url_objects ON url_objects.id = aliases.url_object_id
            WHERE aliases.id = visits.alias_id
              AND url_objects.user_id = auth.uid()
        )
    )
    OR (
        qr_code_id IS NOT NULL
        AND EXISTS (
            SELECT 1
            FROM qr_codes
            JOIN url_objects ON url_objects.id = qr_codes.url_object_id
            WHERE qr_codes.id = visits.qr_code_id
              AND url_objects.user_id = auth.uid()
        )
    )
);

-- INSERT: same three-path check so direct inserts (outside of record_view)
-- are also correctly restricted.
CREATE POLICY "User can insert own visits" ON visits FOR INSERT WITH CHECK (
    (
        url_object_id IS NOT NULL
        AND url_object_id IN (SELECT id FROM url_objects WHERE user_id = auth.uid())
    )
    OR (
        alias_id IS NOT NULL
        AND EXISTS (
            SELECT 1
            FROM aliases
            JOIN url_objects ON url_objects.id = aliases.url_object_id
            WHERE aliases.id = visits.alias_id
              AND url_objects.user_id = auth.uid()
        )
    )
    OR (
        qr_code_id IS NOT NULL
        AND EXISTS (
            SELECT 1
            FROM qr_codes
            JOIN url_objects ON url_objects.id = qr_codes.url_object_id
            WHERE qr_codes.id = visits.qr_code_id
              AND url_objects.user_id = auth.uid()
        )
    )
);

RESET ROLE;
