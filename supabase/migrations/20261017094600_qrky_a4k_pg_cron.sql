-- qrky-a4k: retain visits for 90 days.
-- Runs daily at 03:00 UTC. cron.schedule upserts by job name, so re-running
-- this migration does not create duplicate jobs.

CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
    'delete-old-visits',
    '0 3 * * *',
    $$DELETE FROM visits WHERE created_at < now() - interval '90 days';$$
);
