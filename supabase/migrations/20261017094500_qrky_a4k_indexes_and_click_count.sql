-- qrky-a4k: visits retention groundwork.
--
-- 1. Index the visits foreign keys and created_at (needed by analytics queries
--    and by the retention cleanup job).
-- 2. Denormalize a per-URL click counter onto url_objects so totals do not
--    require scanning visits (which will be pruned after 90 days).
-- 3. Make record_view insert the visit and bump the counter atomically.
-- 4. Add get_total_click_count() for the public stats endpoint.

CREATE INDEX IF NOT EXISTS "visits_url_object_id_idx" ON "public"."visits" ("url_object_id");
CREATE INDEX IF NOT EXISTS "visits_alias_id_idx" ON "public"."visits" ("alias_id");
CREATE INDEX IF NOT EXISTS "visits_qr_code_id_idx" ON "public"."visits" ("qr_code_id");
CREATE INDEX IF NOT EXISTS "visits_created_at_idx" ON "public"."visits" ("created_at");

ALTER TABLE "public"."url_objects"
    ADD COLUMN IF NOT EXISTS "click_count" bigint NOT NULL DEFAULT 0;

-- Backfill from existing visits. A visit belongs to a URL directly
-- (visits.url_object_id) or indirectly through one of its QR codes or aliases.
-- Pairs are de-duplicated per visit so a visit is never counted twice for the
-- same URL.
UPDATE "public"."url_objects" AS u
SET "click_count" = c.cnt
FROM (
    SELECT t.url_object_id, count(*) AS cnt
    FROM (
        SELECT v.id AS visit_id, v.url_object_id AS url_object_id
        FROM "public"."visits" v
        WHERE v.url_object_id IS NOT NULL
        UNION
        SELECT v.id AS visit_id, q.url_object_id AS url_object_id
        FROM "public"."visits" v
        JOIN "public"."qr_codes" q ON q.id = v.qr_code_id
        WHERE q.url_object_id IS NOT NULL
        UNION
        SELECT v.id AS visit_id, a.url_object_id AS url_object_id
        FROM "public"."visits" v
        JOIN "public"."aliases" a ON a.id = v.alias_id
        WHERE a.url_object_id IS NOT NULL
    ) t
    GROUP BY t.url_object_id
) c
WHERE u.id = c.url_object_id;

SET ROLE postgres;

-- Replace record_view: the visit insert and the url_objects.click_count
-- increment happen in the same function call (single transaction).
-- Signature is unchanged, so CREATE OR REPLACE keeps existing grants.
-- Retains SECURITY DEFINER so anonymous redirect visitors can call it.
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
    target_url_object_id bigint;
BEGIN
    IF objectType = 'url_objects' THEN
        SELECT id INTO url_object_id
        FROM url_objects
        WHERE id = record_view.identifier::bigint;

        target_url_object_id := url_object_id;
    END IF;

    IF objectType = 'qr_codes' THEN
        SELECT qr_codes.id, qr_codes.url_object_id
        INTO qr_code_id, target_url_object_id
        FROM qr_codes
        WHERE qr_codes.id = record_view.identifier::uuid;
    END IF;

    IF objectType = 'aliases' THEN
        SELECT aliases.id, aliases.url_object_id
        INTO alias_id, target_url_object_id
        FROM aliases
        WHERE aliases.id = record_view.identifier::uuid;
    END IF;

    INSERT INTO visits (ip_hash, user_agent, url_object_id, qr_code_id, alias_id, country, region)
    VALUES (ip_hash, useragent, url_object_id, qr_code_id, alias_id, country, region);

    IF target_url_object_id IS NOT NULL THEN
        UPDATE url_objects
        SET click_count = click_count + 1
        WHERE id = target_url_object_id;
    END IF;
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

GRANT ALL ON FUNCTION "public"."record_view"("objecttype" "text", "identifier" "text", "ip_hash" "text", "useragent" "text", "country" "text", "region" "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."record_view"("objecttype" "text", "identifier" "text", "ip_hash" "text", "useragent" "text", "country" "text", "region" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."record_view"("objecttype" "text", "identifier" "text", "ip_hash" "text", "useragent" "text", "country" "text", "region" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."record_view"("objecttype" "text", "identifier" "text", "ip_hash" "text", "useragent" "text", "country" "text", "region" "text") TO "service_role";

RESET ROLE;

-- Fast total for the stats endpoint: sums the denormalized counters instead of
-- scanning visits.
CREATE OR REPLACE FUNCTION public.get_total_click_count()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(click_count), 0)::bigint FROM url_objects;
$$;

ALTER FUNCTION public.get_total_click_count() OWNER TO "postgres";
