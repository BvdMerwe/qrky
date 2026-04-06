-- Fix analytics: visits were not being recorded for anonymous visitors because
-- the RLS INSERT policy on visits requires auth.uid(), but redirects are hit
-- by unauthenticated users. Marking record_view as SECURITY DEFINER allows it
-- to run as the function owner (postgres) and bypass RLS on insert.

CREATE OR REPLACE FUNCTION "public"."record_view"(
    "objecttype" "text",
    "identifier" "text",
    "ip" "text",
    "useragent" "text"
) RETURNS "void"
    LANGUAGE "plpgsql"
    SECURITY DEFINER
    SET search_path = public
    AS $$
DECLARE
    alias_id uuid;
    qr_code_id uuid;
    url_object_id bigint;
BEGIN
    IF objectType = 'url_objects' THEN
        SELECT id INTO url_object_id
        FROM url_objects
        WHERE id = record_view.identifier::bigint;
    END IF;

    IF objectType = 'qr_codes' THEN
        SELECT id INTO qr_code_id
        FROM qr_codes
        WHERE id = record_view.identifier::uuid;
    END IF;

    IF objectType = 'aliases' THEN
        SELECT id INTO alias_id
        FROM aliases
        WHERE id = record_view.identifier::uuid;
    END IF;

    INSERT INTO visits (ip, user_agent, url_object_id, qr_code_id, alias_id)
    VALUES (ip, useragent, url_object_id, qr_code_id, alias_id);
END;
$$;

ALTER FUNCTION "public"."record_view"("objecttype" "text", "identifier" "text", "ip" "text", "useragent" "text") OWNER TO "postgres";
