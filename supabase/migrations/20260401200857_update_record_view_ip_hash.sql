-- Update record_view to accept ip_hash, country, region instead of ip.
-- Retains SECURITY DEFINER so anonymous redirect visitors can call it.
-- DROP the old 4-argument overload first — CREATE OR REPLACE cannot replace a
-- function with a different signature; it would create a second overload instead.
DROP FUNCTION IF EXISTS "public"."record_view"("objecttype" "text", "identifier" "text", "ip" "text", "useragent" "text");

CREATE OR REPLACE FUNCTION "public"."record_view"(
    "objecttype" "text",
    "identifier" "text",
    "ip_hash" "text",
    "useragent" "text",
    "country" "text",
    "region" "text"
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

    INSERT INTO visits (ip_hash, user_agent, url_object_id, qr_code_id, alias_id, country, region)
    VALUES (ip_hash, useragent, url_object_id, qr_code_id, alias_id, country, region);
END;
$$;

ALTER FUNCTION "public"."record_view"(
    "objecttype" "text",
    "identifier" "text",
    "ip_hash" "text",
    "useragent" "text",
    "country" "text",
    "region" "text"
    ) OWNER TO "postgres";
