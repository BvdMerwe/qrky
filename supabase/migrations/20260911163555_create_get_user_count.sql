-- Create a secure function to count all auth users.
--
-- The auth schema is not exposed through the PostgREST API by default,
-- so this function lives in the public schema and is callable via RPC
-- with the service-role key for admin/stats usage.

CREATE OR REPLACE FUNCTION public.get_user_count()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)::bigint FROM auth.users;
$$;

ALTER FUNCTION public.get_user_count() OWNER TO "postgres";
