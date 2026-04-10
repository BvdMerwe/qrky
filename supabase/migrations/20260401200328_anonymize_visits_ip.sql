SET ROLE postgres;

-- Rename ip -> ip_hash; add country and region columns to visits. NOTE: Pre-migration values in ip_hash are raw IPs from test data — not backfilled.

ALTER TABLE "public"."visits"
    RENAME COLUMN "ip" TO "ip_hash";

ALTER TABLE "public"."visits"
    ADD COLUMN "country" "text",
    ADD COLUMN "region" "text";
RESET ROLE;
